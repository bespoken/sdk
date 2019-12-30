const Config = require('./config')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const Record = require('./source').Record
const Source = require('./source').Source

class CSVSource extends Source {
  async loadAll () {
    const sourceFile = Config.get('sourceFile')
    console.log(`CSV input file: ${sourceFile}`)

    const utteranceData = fs.readFileSync(sourceFile)
    const rawRecords = parse(utteranceData, {
      columns: true,
      ltrim: true,
      relax_column_count: true,
      relax_column_count_more: true,
      skip_empty_lines: true
    })

    const records = rawRecords.map(r => {
      const record = new Record(r.utterance)
      Object.keys(r).forEach(field => {
        if (field === 'utterance') {
          return
        }

        record.addExpectedField(field, r[field])
      })
      return record
    })
    return Promise.resolve(records)
  }
}

module.exports = CSVSource
