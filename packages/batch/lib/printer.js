const Config = require('@bespoken-sdk/shared/lib/config')
const debug = require('debug')('PRINTER')
const fs = require('fs')
const Job = require('./job')
const path = require('path')
const stringify = require('csv-stringify')

/**
 * The printer class is responsible for outputting results in a human-readable format
 * The default implementation creates a CSV file
 */
class Printer {
  /**
   * @param {string} outputPath
   * @returns {Printer}
   */
  static instance (outputPath) {
    return Config.instance('printer', 'printer', outputPath)
  }

  /**
   * @param {string} outputPath
   */
  constructor (outputPath = 'results') {
    this.outputPath = outputPath.endsWith('.csv') ? `output/${outputPath}` : `output/${outputPath}.csv`
    // Make the output director if it does not exist
    const outputDirectory = path.dirname(this.outputPath)
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory)
    }

    // If there is already an output file, remove it
    if (fs.existsSync(this.outputPath)) {
      fs.unlinkSync(this.outputPath)
    }
  }

  /**
   * Prints out the results for a job
   * @param {Job} job
   * @returns {Promise<void>}
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
    outputHeaders.push('RAW DATA URL')

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

      resultArray.push(result.success + '')
      for (const fieldName of expectedFieldNames) {
        const expected = result.record.expectedFields[fieldName]
        resultArray.push(expected)
      }

      // Add extra output fields
      for (const fieldName of job.outputFieldNames()) {
        const expected = result.outputField(fieldName)
        resultArray.push(expected)
      }

      // Add errors to output
      if (result.error) {
        resultArray.push(result.error)
      } else {
        resultArray.push('')
      }

      // Push a link to the logs
      const index = resultsArray.length - 1
      resultArray.push(`${job.logURL(index)}`)

      resultsArray.push(resultArray)
    })

    debug(`PRINT Success: ${successCount} Ignore: ${ignoreCount} Total: ${job.results.length}`)
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
          fs.writeFile(this.outputPath, output, (error) => {
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
