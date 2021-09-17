const Config = require('@bespoken-sdk/shared').Config
const DevicePool = require('./device').DevicePool
const Evaluator = require('./evaluator')
const Interceptor = require('./interceptor')
const Job = require('./job').Job
const Metrics = require('./metrics')
const MySQLPrinter = require('./mysql-printer')
const Printer = require('./printer')
const Result = require('./job').Result
const Source = require('./source').Source
const Store = require('@bespoken-sdk/store').Store
const Synchronizer = require('./synchronizer')
const util = require('./util')
const logger = require('./logger')
const EmailNotifier = require('./email-notifier')

/**
 *
 */
class BatchRunner {
  /**
   * @param config
   * @param outputPath
   */
  constructor (config, outputPath) {
    this._config = config
    this.outputPath = outputPath
    this._startIndex = 0
    /** @type {Job} */
    this._job = undefined

    Config.singleton('runner', this)
  }

  /**
   *
   */
  static instance () {
    return Config.instance('runner')
  }

  /**
   *
   */
  async process () {
    // Initialize the batch runner
    await this._initialize()
    // Read in the CSV input records
    await this._read()

    if (this._job.records.length === 0) {
      console.error('No records to process in input file')
      process.exit(1)
    }

    let recordsToProcess = process.env.LIMIT || Config.get('limit', false, this._job.records.length)
    if (recordsToProcess > this._job.records.length) {
      recordsToProcess = this._job.records.length
    }

    await this._synchronizer.saveJob('INITIAL')
    this._synchronizer.runSave()

    for (let i = this._startIndex; i < recordsToProcess; i++) {
      const record = this._job.records[i]

      // This runner can operate concurrently
      // It will run as many records simultaneously as there are tokens available
      const device = await this._devicePool.lock(record)

      // In some cases, we may want to force serial processing
      // In this case we use a mutex to force only one record a time to be processed
      const sequential = Config.boolean('sequential')
      if (sequential) {
        await util.mutexAcquire('PROCESS-SEQUENTIAL', 1000, 0, 0)
      }

      this._processRecord(device, record).catch((e) => {
        console.error(`BATCH PROCESS error: ${e}\n${e.stack}`)
      }).finally(async () => {
        // Free the device once we are done with it
        this._devicePool.free(device)

        // Make sure to increment the processed count every time we do a record
        this._job.addProcessedCount()

        // Print out our progress every 100 records for reruns, or with every record for regular runs
        if (this._job.processedCount % 100 === 0 || !this.rerun) {
          console.info(`BATCH PROCESS processed: ${this._job.processedCount} out of ${recordsToProcess}`)
        }

        if (sequential) {
          await util.mutexRelease('PROCESS-SEQUENTIAL')
        }
      })
    }

    // Wait for all records to fnish
    while (this._job.processedCount < recordsToProcess) {
      // console.log(`BATCH PROCESS waiting for records to finish processed: ${this._job.processedCount} total: ${recordsToProcess}`)
      await util.sleep(1000)
    }

    this._synchronizer.stopSave()
    // Do a save once all records are done - in case any writes got skipped due to contention
    console.info('BATCH PROCESS all records done - final save')

    await this._synchronizer.saveJob('FINAL')

    // Print out the results
    await this._print()

    // Custom code for when the process has finished
    await Interceptor.instance().interceptPostProcess(this._job)

    const emailNotifier = EmailNotifier.instance()
    if (!this.job.rerun && emailNotifier.canSend) {
      await emailNotifier.send()
    }
  }

  /**
   *
   */
  async _initialize () {
    // Config can be a file path or a JSON
    // We allow for JSON for testability
    // We do NOT load the config again if already loaded
    if (!Config.loaded()) {
      if (typeof this._config === 'object') {
        Config.loadFromJSON(this._config)
      } else {
        Config.loadFromFile(this._config)
      }
    }
    const jobName = Config.get('job', true)
    this._job = new Job(jobName, undefined, Config.config)

    // Check if we are resuming
    if (process.env.RUN_KEY) {
      const run = process.env.RUN_KEY
      this._job = await Store.instance().fetch(run)
      if (!this._job) {
        throw new Error('BATCH INIT Could not find job to resume: ' + run)
      }
      this._startIndex = this._job.processedCount
      console.info(`BATCH INIT resuming job - starting at: ${this._startIndex}`)
    } else if (this.rerun) {
      // If this is a re-run, set the key to be the same as the previous job
      this._job.key = this.originalJob.key
      this._job.run = this.originalJob.run
      this._job.rerun = true
    }

    // Custom code before processing any record
    await Interceptor.instance().interceptPreProcess(this._job)

    this._devicePool = DevicePool.instance() // Manages virtual devices
    this._synchronizer = new Synchronizer(this._job)
    this._metrics = Metrics.instance()
    return this._metrics.initialize(this._job)
  }

  /**
   * @param device
   * @param record
   */
  async _processRecord (device, record) {
    console.log(`RUNNER PROCESS-RECORD run: ${this._job.run} utterance: ${record.utterance}`)
    // Do just-in-time processing on the record
    await Source.instance().loadRecord(record)

    // Skip a record if the interceptor returns false
    let includeRecord = true
    try {
      includeRecord = await Interceptor.instance().interceptRecord(record)
    } catch (e) {
      console.error(`RUNNER PROCESS-RECORD intercept-record error ${e}`)
    }

    if (includeRecord === false) {
      return
    }

    await this._processWithRetries(device, record)
  }

  /**
   * @param device
   * @param record
   * @param retryCount
   */
  async _processWithRetries (device, record, retryCount = 0) {
    const utterance = record.utterance

    const messages = []
    // If there is a sequence, run through the commands
    if (Config.has('sequence')) {
      const commands = Config.get('sequence')
      commands.forEach(command => messages.push(command))
    }

    messages.push(utterance)

    // Call the virtual device, and grab the last response from the set of messages
    let responses
    let error
    try {
      responses = await device.message(record, messages)
      if (responses) {
        responses.forEach(response => console.log(`RUNNER MESSAGE: ${response.message} TRANSCRIPT: ${response.transcript}`))
      }
    } catch (e) {
      error = e.toString()
    }

    const voiceId = record.voiceID || Config.get('virtualDeviceConfig.voiceID', false, 'en-US-Wavenet-D')
    // Create a result object
    const result = new Result(
      record,
      voiceId,
      responses,
      retryCount
    )

    // Add a tag for the platform being used for the test
    result.addTag('platform', device.platform)

    if (error) {
      result.error = error
      result.success = false
      await Interceptor.instance().interceptError(record, result)

      const hasRetry = result.shouldRetry && result.retryCount < 2
      if (hasRetry) {
        await this._processWithRetries(device, record, retryCount + 1)
      }
    } else {
      // Test the spoken response from Alexa
      Evaluator.evaluate(record, result, result.lastResponse)

      try {
        const include = await Interceptor.instance().interceptResult(record, result)
        const hasRetry = result.shouldRetry && result.retryCount < 2
        if (hasRetry) {
          await this._processWithRetries(device, record, retryCount + 1)
        }

        if (include === false || hasRetry) {
          return
        }
      } catch (e) {
        console.error(`ERROR ON INTERCEPT-RESULT: ${e} `)
        console.error(e.stack)
        result.error = e.toString()
      }
    }

    if (!result.shouldRetry || result.retryCount === 2) {
      this._job.addResult(result)
    }

    // For regular runs, print out the URL for each record as we process it
    if (!this.rerun) {
      console.info(`BATCH URL ${Store.instance().logURL(this._job)}`)
    }

    if (Config.has('postSequence')) {
      const commands = Config.get('postSequence')
      device.message(record, commands)
    }

    if (Config.has('pause')) {
      await util.sleep(Config.get('pause'))
    }

    // Publish to cloudwatch
    await this._metrics.publish(this._job, result)
  }

  /**
   *
   */
  async _read () {
    const source = Source.instance()
    const records = await source.loadAll()
    // Apply the filter to the records
    this._job.records = source.filter(records)
    console.info(`BATCH READ pre-filter: ${records.length} post-filter: ${this._job.records.length}`)
  }

  /**
   *
   */
  async _print () {
    try {
      console.time('BATCH PRINT')
      // We print out records to file
      const printer = new Printer(this.outputPath)
      await printer.print(this._job)

      // If there are mysql credentials, we print out to MySQL
      if (process.env.MYSQL_HOST) {
        const mysqlPrinter = new MySQLPrinter()
        await mysqlPrinter.print(this._job)
      }
      console.timeEnd('BATCH PRINT')
    } catch (e) {
      console.error('BATCH PRINT error: ' + e)
      console.error(e.stack)
    }
  }

  /**
   *
   */
  _saveOnError () {
    if (this.job && this.job.key) {
      this._synchronizer.saveJob('ON ERROR')
    }
  }

  /**
   * @returns {Job} The job created and processed by this runner
   */
  get job () {
    return this._job
  }

  /**
   *
   */
  get originalJob () {
    return this._originalJob
  }

  /**
   *
   */
  set originalJob (job) {
    this._originalJob = job
  }

  /**
   *
   */
  get rerun () {
    return this._originalJob !== undefined
  }
}

process.on('unhandledRejection', (e) => {
  if (BatchRunner.instance()) BatchRunner.instance()._saveOnError()
  console.error('UNHANDLED: ' + e)
  console.error(e.stack)
})

process.on('uncaughtException', (e) => {
  if (BatchRunner.instance()) BatchRunner.instance()._saveOnError()
  console.error('UNCAUGHT: ' + e)
  console.error(e.stack)
})

console.originalLog = console.log

// Special formatting for log messages
// Log and debug
console.log = (message, ...args) => {
  if (args && args.length > 0) {
    // If this uses string substitution, just do a passthrough
    const allArgs = [message].concat(args)
    console.originalLog.apply(console, allArgs)
    return
  }
  logger.debug(message)
}

// Debug
console.debug = (message, ...args) => {
  logger.debug(message, args)
}

// Info
console.info = (message, ...args) => {
  logger.info(message, args)
}

// Warn
console.warn = (message, ...args) => {
  logger.warn(message, args)
}

// Error
console.error = (message, ...args) => {
  logger.error(message, args)
}

module.exports = BatchRunner