const _ = require('lodash')
const Config = require('./config')
const DevicePool = require('./device').DevicePool
const Evaluator = require('./evaluator')
const Interceptor = require('./interceptor')
const Job = require('./job').Job
const Metrics = require('./metrics')
const Record = require('./source').Record
const Result = require('./job').Result
const Source = require('./source').Source
const Store = require('./store')
const util = require('./util')

class BatchRunner {
  constructor (config) {
    this._config = config
    this._startIndex = 0
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

    this._job.totalCount = this._job.records.length

    for (let i = this._startIndex; i < this._job.records.length; i++) {
      const record = this._job.records[i]

      // This runner can operate concurrently
      // It will run as many records simultaneously as there are tokens available
      const device = await this._devicePool.lock()

      await this._processRecord(device, record)

      // Free the device once we are done with it
      this._devicePool.free(device)

      this._job.addProcessedCount()

      // Save the results after each record is done
      await Store.instance().save(this._job)

      await this._print()
    }
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
    if (process.env.RUN_NAME) {
      const run = process.env.RUN_NAME
      this._job = await Store.instance().fetch(run)
      this._startIndex = this._job.processedCount
      console.log(`RESUMING JOB - starting at: ${this._startIndex}`)
    }

    this._devicePool = DevicePool.instance() // Manages virtual devices

    this._metrics = Metrics.instance()
    return this._metrics.initialize()
  }

  async _processRecord (device, record) {
    // Do just-in-time processing on the record
    await Source.instance().loadRecord(record)

    // Skip a record if the interceptor returns false
    const process = await Interceptor.instance().interceptRecord(record)
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

  _print () {
    const Printer = require('./printer')
    Printer.instance().print(this._job)
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
