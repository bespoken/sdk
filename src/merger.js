const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify')
const path = require('path')

class Merger {
  constructor (
    originalResults = './output/results.csv',
    rerunResults = './output/rerun.csv',
    outputPath = './output/merged.csv'
  ) {
    this.originalResults = this.readAndParse(originalResults)
    this.rerunResults = this.readAndParse(rerunResults)
    this.headers = Object.keys(this.originalResults[0])
    this.outputPath = outputPath

    // Make the output director if it does not exist
    const outputDirectory = path.dirname(outputPath)
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory)
    }

    // If there is already an output file, remove it
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
    }

    this.evaluateFiles()
  }

  async merge () {
    console.log('MERGER MERGE merging records')
    const mergedRecords = this.originalResults.map(original => {
      const record = this.rerunResults.find(result => result.UTTERANCE === original.UTTERANCE)
      if (record) {
        console.log(`MERGER MERGE utterance: ${record.UTTERANCE}`)
        return Object.values(record)
      } else {
        return Object.values(original)
      }
    })

    console.log('MERGER MERGE printing results')
    return new Promise((resolve, reject) => {
      stringify([this.headers, ...mergedRecords], {}, (error, output) => {
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

  readAndParse (file) {
    const csv = fs.readFileSync(file)
    return parse(csv, { columns: true })
  }

  evaluateFiles () {
    try {
      if (this.originalResults.length < this.rerunResults.length) {
        throw new Error('Second file should not have more records than the original')
      }
      const secondFileHeaders = Object.keys(this.rerunResults[0])
      const equalHeaders = this.headers.every((header, index) => header === secondFileHeaders[index])

      if (!equalHeaders || this.headers.length !== secondFileHeaders.length) {
        throw new Error('Column headers are not equal')
      }
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    }
  }
}

module.exports = Merger
