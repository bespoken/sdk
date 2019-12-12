const _ = require('lodash')
const Config = require('./config')
const DevicePool = require('./device').DevicePool
const Evaluator = require('./evaluator')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const Metrics = require('./metrics')

class BatchRunner {
  constructor (inputFile) {
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
    Config.load()
    // Create a publish class to send results to AWS Cloudwatch Logs
    this._metrics = Metrics.instance(this._inputFile.split('.')[0])
    return this._metrics.initialize()
  }

  async _processRecord (device, record) {
    const utterance = record.utterance

    console.log('RUNNER ' + utterance + ' WITH ' + device.token)
    // If there is a sequence, run through the commands
    if (Config.has('sequence')) {
      const commands = Config.get('sequence')
      let step = 1
      for (const command of commands) {
        console.log(`RUNNER SEQUENCE STEP ${step}: ${command}`)
        const sequenceResponse = await device.message(command)
        console.log(`RUNNER SEQUENCE STEP ${step} TRANSCRIPT: ${sequenceResponse.transcript}`)
        step++
      }
    }

    const response = await device.message(`${utterance}`)
    console.log('RUNNER RESPONSE: ' + response.transcript)

    // Test the spoken response from Alexa
    const evaluation = Evaluator.evaluate(utterance, record, response)
    console.log('RUNNER VALIDATE: ' + evaluation.success)

    const result = {
      utterance,
      evaluation,
      response
    }
    this._results.push(result)

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

const inputFile = _.nth(process.argv, 2)
if (inputFile) {
  const runner = new BatchRunner(inputFile)
  runner.process(() => {
    console.log('RUNNER DONE!')
  })
} else {
  console.error('BatchRunner requires an argument - the input file to process')
  process.exit(1)
}
