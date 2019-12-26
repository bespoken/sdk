const _ = require('lodash')
const Config = require('./config')
const fs = require('fs')
const Job = require('./job').Job
const stringify = require('csv-stringify/lib/sync')

/**
 * The printer class is responsible for outputting results in a human-readable format
 * The default implementation creates a CSV file
 */
class Printer {
  static instance () {
    return Config.instance('printer', undefined, 'printer')
  }

  /**
   * Prints out the results for a job
   * @param {Job} job
   */
  print (job) {
    let successCount = 0
    let ignoreCount = 0
    const outputHeaders = ['UTTERANCE']
    job.expectedFieldNames().forEach(h => outputHeaders.push('ACTUAL ' + h.toUpperCase()))
    outputHeaders.push('SUCCESS')
    job.expectedFieldNames().forEach(h => outputHeaders.push('EXPECTED ' + h.toUpperCase()))
    job.outputFieldNames().forEach(h => outputHeaders.push(h.toUpperCase()))
    outputHeaders.push('ERROR')

    const resultsArray = [outputHeaders]
    job.results.forEach(async (result) => {
      const ignore = result.error !== undefined
      if (ignore) {
        ignoreCount++
      } else if (result.success) {
        successCount++
      }

      // Print out a line of the CSV
      // First is the utterance
      // Then the actual values
      // Then TRUE or FALSE for success
      // Then the expected values
      const resultArray = [result.record.utteranceRaw]

      const expectedFieldNames = job.expectedFieldNames()
      for (const fieldName of expectedFieldNames) {
        const actual = result.actualFields[fieldName]
        resultArray.push(actual)
      }

      resultArray.push(result.success)
      for (const fieldName of expectedFieldNames) {
        const expected = result.record.expectedFields[fieldName]
        resultArray.push(expected)
      }

      // Add extra output fields
      for (const fieldName of job.outputFieldNames()) {
        const expected = result.outputFields[fieldName]
        resultArray.push(expected)
      }

      if (result.error) {
        resultArray.push(result.error)
      }

      resultsArray.push(resultArray)
      console.log(`Record: ${result.record.utteranceRaw} Success: ${result.success} Count: ${successCount} Ignore: ${ignoreCount}`)
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
