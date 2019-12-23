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
    this._devicePool = new DevicePool() // Manages virtual devices
    this.job
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

    // Use the first record to derive the expected fields
    for (const field in this._records[0]) {
      if (field !== 'utterance' && field !== 'meta') {
        this.job.expectedFields.push(field)
      }
    }

    let recordsProcessed = 0
    this._records.forEach(async (record) => {
      // This runner can operate concurrently
      // It will run as many records simultaneously as there are tokens available
      const device = await this._devicePool.lock()

      await this._processRecord(device, record)

      // Free the device once we are done with it
      this._devicePool.free(device)

      recordsProcessed++

      // When we have processed all the records, print out the results
      if (recordsProcessed === this._records.length) {
        this._print()
      }
    })
  }

  async _initialize () {
    Config.loadFromFile(this._configFile)
    const jobName = Config.get('job', undefined, true)
    this.job = new Job(jobName, undefined, Config.config)

    this._metrics = Metrics.instance()
    return this._metrics.initialize()
  }

  async _processRecord (device, record) {
    // Skip a record if the interceptor returns false
    if (await Interceptor.instance().interceptRecord(record) === false) {
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

    console.log('RUNNER ' + utterance + ' WITH ' + device.token)
    const messages = []
    // If there is a sequence, run through the commands
    if (Config.has('sequence')) {
      const commands = Config.get('sequence')
      commands.forEach(command => messages.push(command))
    }

    messages.push(utterance)

    const responses = await device.message(voiceId, messages)
    console.log('RESPONSE FULL: ' + JSON.stringify(responses, null, 2))
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
    await Interceptor.instance().interceptResult(record, result)

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

    // Save off the current job info
    Store.instance().save(this.job)
  }

  async _read () {
    const source = Source.instance()
    this._records = await source.load()
  }

  _print () {
    const Printer = require('./printer')
    new Printer().print(this.job)
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
