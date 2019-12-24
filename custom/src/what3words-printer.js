const _ = require('lodash')
const fs = require('fs')
const Printer = require('../../src/printer')
const stringify = require('csv-stringify/lib/sync')

class What3WordsPrinter extends Printer {
  print (job) {
    let successCount = 0
    let ignoreCount = 0
    const outputHeaders = ['FILE', 'EXPECTED ADDRESS', 'RECOGNIZED ADDRESS', 'SUGGESTED ADDRESS', 'SUCCESS', 'RAW']
    const resultsArray = [outputHeaders]

    job.results.forEach(async (result) => {
      const ignore = (_.get(result, 'response.error', '').length > 0)
      result.success = false
      if (ignore) {
        ignoreCount++
      } else if (result.evaluation.success) {
        successCount++
      }

      // Print out a line of the CSV
      // First is the utterance
      // Then the actual values
      // Then TRUE or FALSE for success
      // Then the expected values
      const resultArray = [result.utterance,
        result.expectedAddress,
        result.recognizedAddress,
        result.suggestedAddress,
        result.evaluation.success,
        result.raw]

      resultsArray.push(resultArray)
      // console.log(`Record: ${result.utterance} Success: ${result.evaluation.success} Count: ${successCount} Ignore: ${ignoreCount}`)
    })

    const resultsOutput = stringify(resultsArray, {
      cast: {
        boolean: (v) => v ? 'TRUE' : 'FALSE'
      }
    })
    fs.writeFileSync('results.csv', resultsOutput)
  }
}

module.exports = What3WordsPrinter
