const _ = require('lodash')
const Config = require('./config')
const fs = require('fs')
const Job = require('./job').Job
const path = require('path')
const stringify = require('csv-stringify')

const OUTPUT_PATH = 'output/results.csv'
/**
 * The printer class is responsible for outputting results in a human-readable format
 * The default implementation creates a CSV file
 */
class Printer {
  static instance () {
    return Config.instance('printer', 'printer')
  }

  constructor () {
    // Make the output director if it does not exist
    const outputDirectory = path.dirname(OUTPUT_PATH)
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory)
    }

    // If there is already an output file, remove it
    if (fs.existsSync(OUTPUT_PATH)) {
      fs.unlinkSync(OUTPUT_PATH)
    }
  }

  /**
   * Prints out the results for a job
   * @param {Job} job
   */
  async print (job) {
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
    })

    console.log(`PRINTER Success: ${successCount} Ignore: ${ignoreCount} Total: ${job.results.length}`)
    // Create the CSV and the output file asynchronously
    return new Promise((resolve, reject) => {
      stringify(resultsArray, {
        cast: {
          boolean: (v) => v ? 'TRUE' : 'FALSE'
        }
      }, (error, output) => {
        if (error) {
          reject(error)
        } else {
          fs.writeFile(OUTPUT_PATH, output, (error) => {
            if (error) {
              reject(error)
            } else {
              resolve()
            }
          })
        }
      })
    })
  }
}

module.exports = Printer
