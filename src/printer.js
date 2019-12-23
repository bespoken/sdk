const _ = require('lodash')
const fs = require('fs')
const stringify = require('csv-stringify/lib/sync')

class Printer {
  print (job) {
    let successCount = 0
    let ignoreCount = 0
    const outputHeaders = ['utterance']
    job.expectedFields.forEach(h => outputHeaders.push('ACTUAL ' + h.toUpperCase()))
    job.expectedFields.forEach(h => outputHeaders.push('EXPECTED ' + h.toUpperCase()))

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
      const resultArray = [result.utterance]

      for (const fieldName of job.expectedFields) {
        const field = result.evaluation[fieldName]
        resultArray.push(field.actual)
      }
      resultArray.push(result.evaluation.success)
      for (const fieldName of job.expectedFields) {
        const field = result.evaluation[fieldName]
        resultArray.push(field.expected)
      }

      resultsArray.push(resultArray)
      console.log(`Record: ${result.utterance} Success: ${result.evaluation.success} Count: ${successCount} Ignore: ${ignoreCount}`)
    })

    const resultsOutput = stringify(resultsArray, {
      cast: {
        boolean: (v) => v ? 'TRUE' : 'FALSE'
      }
    })
    fs.writeFileSync('results.csv', resultsOutput)
  }
}

module.exports = Printer
