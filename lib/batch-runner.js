const _ = require('lodash')
const device = require('./device')
const Config = require('./config')
const Evaluator = require('./evaluator')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const Metrics = require('./metrics')

// Read in the CSV file
const inputFile = _.get(process, 'env.INPUT_FILE', 'utterances.csv')
const utteranceData = fs.readFileSync(inputFile)

const utterances = parse(utteranceData, {
  columns: true,
  ltrim: true,
  relax_column_count: true,
  relax_column_count_more: true,
  skip_empty_lines: true
})

// Create a publish class to send results to AWS Cloudwatch Logs
const metrics = Metrics.instance()
metrics.initialize(() => {
  console.log('Initialized publisher')
})

const results = []
const tokens = process.env.VIRTUAL_DEVICE_TOKEN.split(',')
let tokensInUse = []
let expectedFields

let count = 0
utterances.forEach(async (record) => {
  console.log('RECORD: ' + JSON.stringify(record, null, 2))
  // Create the list of headers, if it has not already been created
  if (!expectedFields) {
    expectedFields = []
    for (const field in record) {
      if (field !== 'utterance') {
        expectedFields.push(field)
      }
    }
  }
  const utterance = record.utterance

  console.log('TEST ENQUEUE: ' + utterance + ' AVAILABLE: ' + (tokens.length - tokensInUse.length))
  while (tokensInUse.length === tokens.length) {
    await device.pause(5000)
  }

  const token = tokens.find(t => tokensInUse.indexOf(t) === -1)
  tokensInUse.push(token)

  console.log('TEST RUN ' + utterance + ' WITH ' + token)
  // If there is a sequence, run through the commands
  if (Config.has('sequence')) {
    const commands = Config.get('sequence')
    let step = 1
    for (const command of commands) {
      console.log(`SEQUENCE STEP ${step}: ${command}`)
      const sequenceResponse = await device.message(token, command)
      console.log(`SEQUENCE STEP ${step} TRANSCRIPT: ${JSON.stringify(sequenceResponse.transcript, null, 2)}`)
      step++
    }
  }

  const response = await device.message(token, `${utterance}`)
  console.log('TEST RESPONSE: ' + JSON.stringify(response, null, 2))

  // Test the spoken response from Alexa
  const evaluation = Evaluator.evaluate(utterance, record, response)
  console.log('TEST VALIDATE: ' + evaluation.success)

  const result = {
    utterance,
    evaluation,
    response
  }
  results.push(result)

  // Publish to cloudwatch
  await metrics.publish(result)

  console.log('TEST AFTER STOP ' + token)
  await device.pause(10000)
  await device.message(token, 'stop')
  tokensInUse = _.pull(tokensInUse, token)
  console.log('TEST AFTER STOPPED ' + token + ' AVAILABLE: ' + +(tokens.length - tokensInUse.length))
  count++

  if (count === utterances.length) {
    await onCompleted(results)
  }
})

const onCompleted = async (results) => {
  const Printer = require('./printer')
  new Printer().print(results, expectedFields)
}
