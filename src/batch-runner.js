const _ = require('lodash')
const Config = require('./config')
const DevicePool = require('./device').DevicePool
const Evaluator = require('./evaluator')
const Interceptor = require('./interceptor')
const Job = require('./job').Job
const Metrics = require('./metrics')
const Printer = require('./printer')
const Record = require('./source').Record
const Result = require('./job').Result
const Source = require('./source').Source
const Store = require('./store')
const util = require('./util')

class BatchRunner {
  constructor (config) {
    this._config = config
    this._startIndex = 0
    /** @type {Job} */
    this._job = undefined
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
    recordsToProcess = +recordsToProcess

    if (isNaN(recordsToProcess)) {
      console.error('INVALID VALUE for limit key in configuration file. Use a positive number.')
      process.exit(1)
    }

    for (let i = this._startIndex; i < recordsToProcess; i++) {
      const record = this._job.records[i]

      // This runner can operate concurrently
      // It will run as many records simultaneously as there are tokens available
      const device = await this._devicePool.lock(record)

      this._processRecord(device, record).catch((e) => {
        console.error(`BATCH process error: ${e}\n${e.stack}`)
      }).finally(() => {
        // Free the device once we are done with it
        this._devicePool.free(device)

        // Make sure to increment the processed count every time we do a record
        this._job.addProcessedCount()
        console.log(`BATCH PROCESS processed: ${this._job.processedCount} out of ${recordsToProcess}`)
      })
    }

    // Wait for all records to fnish
    while (this._job.processedCount < recordsToProcess) {
      console.log(`BATCH PROCESS waiting for records to finish processed: ${this._job.processedCount} total: ${recordsToProcess}`)
      await util.sleep(1000)
    }

    // Do a save once all records are done - in case any writes got skipped due to contention
    console.log('BATCH PROCESS all records done - final save')
    const key = await this._save()
    console.log(`BATCH PROCESS done - job key: ${key}`)
  }

  async _initialize () {
    // Config can be a file path or a JSON
    // We allow for JSON for testability
    if (typeof this._config === 'object') {
      Config.loadFromJSON(this._config)
    } else {
      Config.loadFromFile(this._config)
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
    let process = true
    try {
      process = await Interceptor.instance().interceptRecord(record)
    } catch (e) {
      console.error(`RUNNER PROCESS-RECORD intercept-record error ${e}`)
    }

    if (process === false) {
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
      responses.forEach(response => console.log(`RUNNER MESSAGE: ${response.message} TRANSCRIPT: ${response.transcript}`))
      lastResponse = _.nth(responses, -1)
    } catch (e) {
      error = e
    }

    // Create a result object
    const result = new Result(
      record,
      voiceId,
      lastResponse
    )

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
        console.error(`ERROR ${e} SKIPPING RECORD`)
        console.error(e.stack)
        result.error = e
      }
    }

    this._job.addResult(result)

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
      const key = await Store.instance().save(this._job)
      await Printer.instance().print(key, this._job)
      console.timeEnd('BATCH SAVE')
      console.log(`BATCH SAVE completed key: ${key}`)
      return key
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

module.exports = BatchRunner
