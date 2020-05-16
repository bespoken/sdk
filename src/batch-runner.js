const _ = require('lodash')
const Config = require('./config')
const DevicePool = require('./device').DevicePool
const Evaluator = require('./evaluator')
const Interceptor = require('./interceptor')
const Job = require('./job').Job
const Metrics = require('./metrics')
const Printer = require('./printer')
const Result = require('./job').Result
const Source = require('./source').Source
const Store = require('./store')
const util = require('./util')

class BatchRunner {
  constructor (config, outputPath) {
    this._config = config
    this.outputPath = outputPath
    this._startIndex = 0
    /** @type {Job} */
    this._job = undefined
    this.rerun = false
  }

  async process () {
    // Initialize the batch runner
    await this._initialize()

    // Read in the CSV input records
    await this._read()

    if (this._job.records.length === 0) {
      console.error('No records to process in input file')
      process.exit(1)
    }

    let recordsToProcess = Config.get('limit', [], false, this._job.records.length)
    if (recordsToProcess > this._job.records.length) {
      recordsToProcess = this._job.records.length
    }

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
        console.log(`BATCH PROCESS processed: ${this._job.processedCount} out of ${recordsToProcess}`)

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

    // Do a save once all records are done - in case any writes got skipped due to contention
    console.log('BATCH PROCESS all records done - final save')
    await this._save()
  }

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
    const jobName = Config.get('job', undefined, true)
    this._job = new Job(jobName, undefined, Config.config)

    // Check if we are resuming
    if (process.env.RUN_KEY) {
      const run = process.env.RUN_KEY
      this._job = await Store.instance().fetch(run)
      if (!this._job) {
        throw new Error('BATCH INIT Could not find job to resume: ' + run)
      }
      this._startIndex = this._job.processedCount
      console.log(`BATCH INIT resuming job - starting at: ${this._startIndex}`)
    }

    this._devicePool = DevicePool.instance() // Manages virtual devices

    this._metrics = Metrics.instance()
    return this._metrics.initialize(this._job)
  }

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

    // If we have several voices configured, run through each one
    if (Config.has('voices')) {
      for (const voice of Config.get('voices')) {
        await this._processVariation(device, record, voice)
      }
    } else {
      await this._processVariation(device, record)
    }

    // If this is a rerun, we don't save until the end
    if (this.rerun) {
      return
    }

    // Save the results after each record is done
    // We synchronize these operatons with a mutex - so only one write happens at a time
    // If another record is trying to write at the same time, we just move on
    const acquired = await util.mutexAcquire()
    if (acquired) {
      try {
        await this._save()
      } finally {
        util.mutexRelease()
      }
    } else {
      console.log('BATCH SAVE skipping')
    }
  }

  async _processVariation (device, record, voiceId = 'en-US-Wavenet-D') {
    const utterance = record.utterance

    const messages = []
    // If there is a sequence, run through the commands
    if (Config.has('sequence')) {
      const commands = Config.get('sequence')
      commands.forEach(command => messages.push(command))
    }

    messages.push(utterance)

    // Call the virtual device, and grab the last response from the set of messages
    let lastResponse
    let error
    try {
      const responses = await device.message(voiceId, messages)
      if (responses) {
        responses.forEach(response => console.log(`RUNNER MESSAGE: ${response.message} TRANSCRIPT: ${response.transcript}`))
      }
      lastResponse = _.nth(responses, -1)
    } catch (e) {
      error = e.toString()
    }

    // Create a result object
    const result = new Result(
      record,
      voiceId,
      lastResponse
    )

    // Add a tag for the platform being used for the test
    result.addTag('platform', device.platform)

    if (error) {
      result.error = error
    } else {
      // Test the spoken response from Alexa
      Evaluator.evaluate(record, result, lastResponse)

      try {
        const include = await Interceptor.instance().interceptResult(record, result)
        if (include === false) {
          return
        }
      } catch (e) {
        console.error(`ERROR ON INTERCEPT-RESULT: ${e} `)
        console.error(e.stack)
        result.error = e.toString()
      }
    }

    this._job.addResult(result)
    console.log(`BATCH PROCESS record completed. URL: ${Store.instance().logURL(this._job)}`)

    if (Config.has('postSequence')) {
      const commands = Config.get('postSequence')
      device.message(voiceId, commands)
    }

    if (Config.has('pause')) {
      await util.sleep(Config.get('pause'))
    }

    // Publish to cloudwatch
    await this._metrics.publish(this._job, result)
  }

  async _read () {
    const source = Source.instance()
    const records = await source.loadAll()
    // Apply the filter to the records
    this._job.records = source.filter(records)
    console.log(`BATCH READ pre-filter: ${records.length} post-filter: ${this._job.records.length}`)
  }

  async _save () {
    try {
      console.time('BATCH SAVE')
      await Store.instance().save(this._job)
      await Printer.instance(this.outputPath).print(this._job)
      console.timeEnd('BATCH SAVE')
      console.log(`BATCH SAVE completed key: ${this._job.key}`)
    } catch (e) {
      console.error('BATCH SAVE error: ' + e)
    }
  }

  /**
   * @returns {Job} The job created and processed by this runner
   */
  get job () {
    return this._job
  }
}

process.on('unhandledRejection', (e) => {
  console.error('UNHANDLED: ' + e)
  console.error(e.stack)
})

console.originalLog = console.log

// Special formatting for log messages
console.log = (message, ...args) => {
  if (args && args.length > 0) {
    // If this uses string substitution, just do a passthrough
    const allArgs = [message].concat(args)
    console.originalLog.apply(console, allArgs)
    return
  }

  const parts = message.split(' ')
  let formattedMessage = message
  if (parts.length >= 3) {
    const module = parts[0]
    const method = parts[1]
    const contents = parts.slice(2).join(' ')
    formattedMessage = _.padEnd(module, 15) + _.padEnd(method, 15) + contents
  }
  process.stdout.write(formattedMessage + '\n')
}

module.exports = BatchRunner
