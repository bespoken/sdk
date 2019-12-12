const _ = require('lodash')
const Config = require('./config')
const DevicePool = require('./device').DevicePool
const Evaluator = require('./evaluator')
const fs = require('fs')
const Metrics = require('./metrics')
const parse = require('csv-parse/lib/sync')
const path = require('path')
const util = require('./util')

class BatchRunner {
  constructor (configFile, inputFile) {
    this._configFile = configFile
    this._devicePool = new DevicePool() // Manages virtual devices
    this._inputFile = inputFile
    this._expectedFields = [] // The array of expected fields used for testing the results
    this._results = [] // Results from the batch runner
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
      if (field !== 'utterance') {
        this._expectedFields.push(field)
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
    Config.load(this._configFile)
    // Create a publish class to send results to metrics service (DataDog or CloudWatch)
    // The run name uniquely tags metrics created by this process
    // We use the input file name for this - e.g., for C:/Users/bespoken/test/inputs.csv it will be inputs
    const runName = path.parse(this._inputFile).name
    this._metrics = Metrics.instance(runName)
    return this._metrics.initialize()
  }

  async _processRecord (device, record) {
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
    responses.forEach(response => console.log(`RUNNER MESSAGE: ${response.message} TRANSCRIPT: ${response.transcript}`))

    const lastResponse = _.nth(responses, -1)
    // Test the spoken response from Alexa
    const evaluation = Evaluator.evaluate(utterance, record, lastResponse)
    console.log('RUNNER VALIDATE: ' + evaluation.success)

    const result = {
      utterance,
      voiceId,
      evaluation,
      lastResponse
    }
    this._results.push(result)

    if (Config.has('postSequence')) {
      const commands = Config.get('postSequence')
      device.message(voiceId, commands)
    }

    if (Config.has('pause')) {
      await util.sleep(Config.get('pause'))
    }

    // Publish to cloudwatch
    await this._metrics.publish(result)
  }

  _read () {
    const utteranceData = fs.readFileSync(this._inputFile)

    this._records = parse(utteranceData, {
      columns: true,
      ltrim: true,
      relax_column_count: true,
      relax_column_count_more: true,
      skip_empty_lines: true
    })
  }

  _print () {
    const Printer = require('./printer')
    new Printer().print(this._results, this._expectedFields)
  }
}

const configFile = _.nth(process.argv, 2)
const inputFile = _.nth(process.argv, 3)

if (inputFile && configFile) {
  const runner = new BatchRunner(configFile, inputFile)
  runner.process(() => {
    console.log('RUNNER DONE!')
  })
} else {
  console.error('BatchRunner requires two arguments - the config file and the CSV file to process')
  process.exit(1)
}
