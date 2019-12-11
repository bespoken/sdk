const _ = require('lodash')
const device = require('./device')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const Publisher = require('./publisher')
const stringify = require('csv-stringify/lib/sync')

// Read in the CSV file
const inputFile = _.get(process, 'env.INPUT_FILE', 'utterances.csv')
const utteranceData = fs.readFileSync(inputFile)

const utterances = parse(utteranceData, {
  ltrim: true,
  relax_column_count: true,
  relax_column_count_more: true,
  skip_empty_lines: true
})

// Create a publish class to send results to AWS Cloudwatch Logs
const metrics = Metrics.instance()
publisher.initialize(() => {
  console.log('Initialized publisher')
})

// Reading in the testing.json file
const testingJSON = JSON.parse(fs.readFileSync('testing.json'))

const results = []
const tokens = [testingJSON.virtualDeviceToken]
let tokensInUse = []

let count = 0
utterances.forEach(async (fields) => {
  const utterance = fields[0]
  const expectedResponses = fields.slice(1)
  console.log('TEST ENQUEUE: ' + utterance + ' AVAILABLE: ' + (tokens.length - tokensInUse.length))
  while (tokensInUse.length === tokens.length) {
    await device.pause(5000)
  }

  const token = tokens.find(t => tokensInUse.indexOf(t) === -1)
  tokensInUse.push(token)

  console.log('TEST RUN ' + utterance + ' WITH ' + token)
  const response = await device.message(token, `${utterance}`)
  console.log('TEST RESPONSE: ' + JSON.stringify(response, null, 2))

  // Test the spoken response from Alexa
  const success = evaluate(utterance, expectedResponses, response)
  console.log('TEST VALIDATE: ' + success)

  const result = {
    utterance,
    expectedResponses,
    response,
    success
  }
  results.push(result)

  // Publish to cloudwatch
  await publisher.publishUtteranceResults(result)

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
  let successCount = 0
  let ignoreCount = 0
  const resultsArray = [['name', 'actualResponse', 'success', 'expectedResponses']]
  results.forEach(async (result) => {
    const ignore = (_.get(result, 'response.error', '').length > 0)
    result.success = false
    if (ignore) {
      ignoreCount++
    } else {
      result.success = evaluate(result.utterance, result.expectedResponses, result.response)
      if (result.success) {
        successCount++
      }
    }

    const resultArray = [result.utterance, result.response.transcript, result.success]
    result.expectedResponses.forEach(e => resultArray.push(e))
    resultsArray.push(resultArray)
    console.log(`Record: ${result.utterance} Success: ${result.success} Count: ${successCount} Ignore: ${ignoreCount}`)
  })

  const resultsOutput = stringify(resultsArray, {
    cast: {
      boolean: (v) => v ? 'true' : 'false'
    }
  })
  fs.writeFileSync('utterance-results.csv', resultsOutput)
}

const partialMatch = (actual, expected) => {
  if (!actual) {
    return false
  }

  return actual.toLowerCase().includes(expected)
}

const evaluate = (utterance, expectedResponses, response) => {
  console.log('ExpectedResponses: ' + expectedResponses)
  for (const expectedResponse of expectedResponses) {
    if (expectedResponse.trim() === '*') {
      return true
    }

    if (partialMatch(response.transcript, expectedResponse)) {
      return true
    }
  }
}
