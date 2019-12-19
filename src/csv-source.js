const Config = require('./config')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const Source = require('./source')

class CSVSource extends Source {
  async load () {
    const inputFile = Config.get('inputFile')
    const utteranceData = fs.readFileSync(inputFile)

    const records = parse(utteranceData, {
      columns: true,
      ltrim: true,
      relax_column_count: true,
      relax_column_count_more: true,
      skip_empty_lines: true
    })

    return Promise.resolve(records)
  }
}

module.exports = CSVSource
