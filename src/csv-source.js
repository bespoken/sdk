const Config = require('./config')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const Record = require('./source').Record
const Source = require('./source').Source

class CSVSource extends Source {
  async loadAll () {
    let sourceFile = Config.get('sourceFile')
    if (!sourceFile) {
      console.warn('CSV-SOURCE LOADALL no sourceFile specified in config - using default')
      sourceFile = 'input/records.csv'
    }
    console.log(`CSV-SOURCE LOADALL input file: ${sourceFile}`)

    if (!fs.existsSync(sourceFile)) {
      console.error(`CSV-SOURCE LOADALL error - file does not exist: ${sourceFile}`)
      process.exit(1)
    }
    const utteranceData = fs.readFileSync(sourceFile)
    const rawRecords = parse(utteranceData, {
      columns: true,
      ltrim: true,
      relax_column_count: true,
      relax_column_count_more: true,
      skip_empty_lines: true
    })

    const records = rawRecords.map(r => {
      const utteranceProperty = Object.keys(r).find(property => property.trim().toLowerCase() === 'utterance')
      const utterance = r[utteranceProperty]
      if (!utterance || utterance.trim().length === 0 || utterance.startsWith('#')) {
        console.log(`CSV-SOURCE LOADALL skipping utterance: ${utterance}`)
        return undefined
      }

      const record = new Record(r[utteranceProperty])

      // Add device tags automatically from the column labeled device
      const deviceProperty = Object.keys(r).find(property => property.trim().toLowerCase() === 'device')
      const device = r[deviceProperty]
      if (device) {
        record.addDeviceTag(device)
      }

      Object.keys(r).forEach(field => {
        if (field.trim().toLowerCase() === 'utterance' || field.trim().toLowerCase() === 'device') {
          return
        }

        record.addExpectedField(field, r[field])
      })
      return record
    }).filter(r => r !== undefined) // Remove undefined records - i.e., the ones we skipped

    return Promise.resolve(records)
  }
}

module.exports = CSVSource
