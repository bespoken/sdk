const Config = require('@bespoken-sdk/shared/lib/config')
const Device = require('./device').Device
const DevicePool = require('./device').DevicePool
const EmailNotifier = require('./email-notifier')
const Evaluator = require('./evaluator')
const Interceptor = require('./interceptor')
const Job = require('./job')
const logger = require('@bespoken-sdk/shared/lib/logger')('RUNNER')
const Metrics = require('./metrics')
const Printer = require('./printer')
const Record = require('./record')
const Result = require('./result')
const Source = require('./source')
const SQLPrinter = require('./sql-printer')
const Store = require('@bespoken-sdk/store/lib/client')
const Synchronizer = require('./synchronizer')
const util = require('./util')

require('dotenv').config()

/**
 *
 */
class BatchRunner {
  /**
   * @returns {BatchRunner}
   */
  static instance () {
    return Config.instance('runner')
  }
  
  /**
   * @param {any} config
   * @param {string} outputPath
   */
  constructor (config, outputPath) {
    this._config = config
    this.outputPath = outputPath
    this._startIndex = 0
    /** @type {Job | undefined} */
    this._job = undefined

    Config.singleton('runner', this)
  }
  
  /**
   * @returns {DevicePool}
   */
  get devicePool() {
    if (!this._devicePool) {
      throw new Error('Device Pool is not created yet! Should not have been called')
    }
    return this._devicePool
  }
  /**
   * @returns {Job} The job created and processed by this runner
   */
  get job () {
    if (!this._job) {
      throw new Error('Job is not created yet! Should not have been called')
    }
    return this._job
  }
  /**
   * @returns {Job | undefined}
   */
  get originalJob () {
    return this._originalJob
  }

  /**
   *
   */
  set originalJob(job) {
    this._originalJob = job
  }

  /**
   * @returns {boolean}
   */
  get rerun () {
    return this._originalJob !== undefined
  }

  /**
   * @returns {Synchronizer}
   */
  get synchronizer() {
    if (!this._synchronizer) {
      throw new Error('Synchronizer not yet created - this should not be called yet')
    }
    return this._synchronizer
  }

  /**
   * @returns {Promise<void>}
   */
  async process () {
    // Initialize the batch runner
    await this._initialize()
    // Read in the CSV input records
    await this._read()

    if (this.job.records.length === 0) {
      logger.error('No records to process in input file')
      process.exit(1)
    }

    let recordsToProcess = process.env.LIMIT || Config.get('limit', false, this.job.records.length)
    if (recordsToProcess > this.job.records.length) {
      recordsToProcess = this.job.records.length
    }

    await this.synchronizer.saveJob('INITIAL')
    this.synchronizer.runSave()

    for (let i = this._startIndex; i < recordsToProcess; i++) {
      const record = this.job.records[i]

      // This runner can operate concurrently
      // It will run as many records simultaneously as there are tokens available
      const device = await this.devicePool.lock(record)

      // In some cases, we may want to force serial processing
      // In this case we use a mutex to force only one record a time to be processed
      const sequential = Config.boolean('sequential')
      if (sequential) {
        await util.mutexAcquire('PROCESS-SEQUENTIAL', 1000, 0, 0)
      }

      this._processRecord(device, record).catch((e) => {
        logger.error(`BATCH PROCESS error: ${e}\n${e.stack}`)
      }).finally(async () => {
        // Free the device once we are done with it
        this.devicePool.free(device)

        // Make sure to increment the processed count every time we do a record
        this.job.addProcessedCount()

        // Print out our progress every 100 records for reruns, or with every record for regular runs
        if (this.job.processedCount % 100 === 0 || !this.rerun) {
          logger.info(`BATCH PROCESS processed: ${this.job.processedCount} out of ${recordsToProcess}`)
        }

        if (sequential) {
          await util.mutexRelease('PROCESS-SEQUENTIAL')
        }
      })
    }

    // Wait for all records to fnish
    while (this.job.processedCount < recordsToProcess) {
      // logger.log(`BATCH PROCESS waiting for records to finish processed: ${this._job.processedCount} total: ${recordsToProcess}`)
      await util.sleep(1000)
    }

    this.synchronizer.stopSave()
    // Do a save once all records are done - in case any writes got skipped due to contention
    logger.info('BATCH PROCESS all records done - final save')

    await this.synchronizer.saveJob('FINAL')

    // Print out the results
    await this._print()

    // Custom code for when the process has finished
    await Interceptor.instance().interceptPostProcess(this.job)

    const emailNotifier = EmailNotifier.instance()
    if (!this.job.rerun && emailNotifier.canSend) {
      await emailNotifier.send()
    }
  }

  
  /**
   * @returns {Promise<void>}
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
      const store = new Store()
      this._job = Job.fromJSON(await store.fetch(run))
      if (!this._job) {
        throw new Error('BATCH INIT Could not find job to resume: ' + run)
      }
      this._startIndex = this._job.processedCount
      logger.info(`BATCH INIT resuming job - starting at: ${this._startIndex}`)
    } else if (this.rerun) {
      if (!this.originalJob) {
        throw new Error('Rerunning but no original job set. Exiting.')
      }
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
   * @param {Device} device
   * @param {Record} record
   * @returns {Promise<void>}
   */
  async _processRecord (device, record) {
    if (record.utterance.includes("{")) {
      logger.info(`RUNNER PROCESS-RECORD run: ${this.job.run} utterance: ${JSON.parse(record.utterance).UTTERANCE}`)
    } else {
      logger.info(`RUNNER PROCESS-RECORD run: ${this.job.run} utterance: ${record.utterance}`)
    }
    // Do just-in-time processing on the record
    await Source.instance().loadRecord(record)

    // Skip a record if the interceptor returns false
    let includeRecord = true
    try {
      includeRecord = await Interceptor.instance().interceptRecord(record)
    } catch (e) {
      logger.error(`RUNNER PROCESS-RECORD intercept-record error ${e}`)
    }

    if (includeRecord === false) {
      return
    }

    await this._processWithRetries(device, record)
  }

  /**
   * @param {Device} device
   * @param {Record} record
   * @param {number} [retryCount=0]
   * @returns {Promise<void>}
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
        responses.forEach(response => logger.debug(`RUNNER MESSAGE: ${response.message} TRANSCRIPT: ${response.transcript}`))
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
        logger.error(`ERROR ON INTERCEPT-RESULT: ${e} `)
        logger.error(e.stack)
        result.error = e.toString()
      }
    }

    if (!result.shouldRetry || result.retryCount === 2) {
      this.job.addResult(result)
    }

    // For regular runs, print out the URL for each record as we process it
    if (!this.rerun) {
      logger.info(`BATCH URL ${this.job.logURL(this.job.results.length - 1)}`)
    }

    if (Config.has('postSequence')) {
      const commands = Config.get('postSequence')
      device.message(record, commands)
    }

    if (Config.has('pause')) {
      await util.sleep(Config.get('pause'))
    }

    // Publish to cloudwatch
    if (this._metrics) await this._metrics.publish(this.job, result)
  }

  /**
   * @returns {Promise<void>}
   */
  async _read () {
    const source = Source.instance()
    const records = await source.loadAll()
    // Apply the filter to the records
    this.job.records = source.filter(records)
    logger.info(`BATCH READ pre-filter: ${records.length} post-filter: ${this.job.records.length}`)
  }

  /**
   * @returns {Promise<void>}
   */
  async _print () {
    try {
      logger.time('BATCH PRINT')
      // We print out records to file
      const printer = new Printer(this.outputPath)
      await printer.print(this.job)

      // If there are mysql credentials, we print out to MySQL
      if (process.env.MYSQL_HOST) {
        const mysqlPrinter = new SQLPrinter()
        await mysqlPrinter.print(this.job)
      }
      logger.timeEnd('BATCH PRINT')
    } catch (e) {
      logger.error('BATCH PRINT error: ' + e)
      logger.error(e.stack)
    }
  }

  /**
   * @returns {void}
   */
  _saveOnError () {
    if (this.job && this.job.key) {
      this.synchronizer.saveJob('ON ERROR')
    }
  }
}

process.on('unhandledRejection', (e) => {
  if (BatchRunner.instance()) BatchRunner.instance()._saveOnError()
  logger.error('UNHANDLED: ' + e)
})

process.on('uncaughtException', (e) => {
  if (BatchRunner.instance()) BatchRunner.instance()._saveOnError()
  logger.error('UNCAUGHT: ' + e)
  if (e.stack) {
    logger.error(e.stack)
  }
})

module.exports = BatchRunner
