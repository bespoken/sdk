const _ = require('lodash')
const Config = require('./config')
const DevicePool = require('./device').DevicePool
const Evaluator = require('./evaluator')
const Interceptor = require('./interceptor')
const Job = require('./job')
const Metrics = require('./metrics')
const Source = require('./source')
const Store = require('./store')
const util = require('./util')

class BatchRunner {
  constructor (configFile) {
    this._configFile = configFile
    this._startIndex = 0
  }

  async process () {
    // Initialize the batch runner
    await this._initialize()

    // Read in the CSV input records
    await this._read()

    if (this._records.length === 0) {
      console.error('No records to process in input file')
      process.exit(1)
    }

    this.job.totalCount = this._records.length

    // Use the first record to derive the expected fields
    for (const field in this._records[0]) {
      if (field !== 'utterance' && field !== 'meta') {
        this.job.expectedFields.push(field)
      }
    }

    for (let i = this._startIndex; i < this._records.length; i++) {
      const record = this._records[i]
      // This runner can operate concurrently
      // It will run as many records simultaneously as there are tokens available
      const device = await this._devicePool.lock()

      console.log(`PROCESS RECORD - index: ${i} say: ${record.utterance} `)

      await this._processRecord(device, record)

      // Free the device once we are done with it
      this._devicePool.free(device)

      this.job.addProcessedCount()

      // Save the results after each record is done
      Store.instance().save(this.job)

      this._print()
    }
  }

  async _initialize () {
    Config.loadFromFile(this._configFile)
    const jobName = Config.get('job', undefined, true)
    this.job = new Job(jobName, undefined, Config.config)

    // Check if we are resuming
    if (process.env.RUN_NAME) {
      const run = process.env.RUN_NAME
      this.job = await Store.instance().fetch(run)
      this._startIndex = this.job.processedCount
      console.log(`RESUMING JOB - starting at: ${this._startIndex}`)
    }

    this._devicePool = new DevicePool() // Manages virtual devices

    this._metrics = Metrics.instance()
    return this._metrics.initialize()
  }

  async _processRecord (device, record) {
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

    const responses = await device.message(voiceId, messages)
    // console.log('RESPONSE FULL: ' + JSON.stringify(responses, null, 2))
    responses.forEach(response => console.log(`RUNNER MESSAGE: ${response.message} TRANSCRIPT: ${response.transcript}`))

    const lastResponse = _.nth(responses, -1)
    // Test the spoken response from Alexa
    const evaluation = Evaluator.evaluate(utterance, record, this.job.expectedFields, lastResponse)
    console.log('RUNNER VALIDATE: ' + evaluation.success)

    const result = {
      utterance,
      voiceId,
      evaluation,
      lastResponse
    }
    try {
      await Interceptor.instance().interceptResult(record, result)
    } catch (e) {
      console.error(`ERROR ${e} SKIPPING RECORD`)
      console.error(e.stack)
      return
    }
    this.job.addResult(result)

    if (Config.has('postSequence')) {
      const commands = Config.get('postSequence')
      device.message(voiceId, commands)
    }

    if (Config.has('pause')) {
      await util.sleep(Config.get('pause'))
    }

    // Publish to cloudwatch
    await this._metrics.publish(this.job, result)
  }

  async _read () {
    const source = Source.instance()
    this._records = await source.load()
  }

  _print () {
    const Printer = require('./printer')
    Printer.instance().print(this.job)
  }
}

const configFile = _.nth(process.argv, 2)

if (configFile) {
  const runner = new BatchRunner(configFile)
  runner.process(() => {
    console.log('RUNNER DONE!')
  })
} else {
  console.error('BatchRunner requires two arguments - the config file and the CSV file to process')
  process.exit(1)
}

process.on('unhandledRejection', (e) => {
  console.error('UNHANDLED: ' + e)
  console.error(e.stack)
})
