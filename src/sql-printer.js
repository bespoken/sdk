const sqlite3 = require('sqlite3').verbose()
const Store = require('./store')

/**
 * Sends results of tests to SQLite database
 */
class SQLPrinter {
  constructor () {
    this.tableName = 'RESULTS'
  }

  async reset () {
    return this._run(`DROP TABLE ${this.tableName}`)
  }

  _connect () {
    this.db = new sqlite3.Database('output/results.db')
  }

  async print (job, reset = false) {
    this._connect()
    if (reset) {
      try {
        await this.reset(job)
      } catch (e) {
        console.error('SQL-PRINTER PRINT reset error: ' + e.toString())
      }
    }

    if (!this.fields) {
      await this._setup(job)
    }

    const insertSQL = `INSERT INTO ${this.tableName} (${this.fields.map(f => f.name).join(',\n')}) values (${this.fields.map(f => '?').join(', ')})`
    console.log('SQLLITE PRINT insert-sql: ' + insertSQL)
    const statement = this._prepare(insertSQL)

    let index = 0
    for (const result of job.results) {
      const params = [result.record.utteranceRaw, job.run, job.name]

      const expectedFieldNames = job.expectedFieldNames()
      for (const fieldName of expectedFieldNames) {
        const actual = result.actualFields[fieldName]
        params.push(actual)
      }

      params.push(result.success + '')
      for (const fieldName of expectedFieldNames) {
        const expected = result.record.expectedFields[fieldName]
        params.push(expected)
      }

      // Add extra output fields
      for (const fieldName of job.outputFieldNames()) {
        const expected = result.outputField(fieldName)
        params.push(expected)
      }
      params.push(result.error)

      // Push a link to the logs
      params.push(`${Store.instance().logURL(job, index)}`)

      // resultsArray.push(resultArray)
      await statement.run(params)
      index++

      // Print out how many records we have printed every 100 records
      if (index % 100 === 0) {
        console.info(`SQL-PRINTER PRINT records: ${index}/${job.results.length}`)
      }
    }

    await statement.finalize()
  }

  async _setup (job) {
    this.fields = []
    this._addField('UTTERANCE', 'text')
    this._addField('RUN', 'text')
    this._addField('JOB', 'text')

    const expectedFieldNames = job.expectedFieldNames()
    for (const fieldName of expectedFieldNames) {
      this._addField(`ACTUAL_${fieldName}`, 'text')
    }

    this._addField('SUCCESS', 'text')

    for (const fieldName of expectedFieldNames) {
      this._addField(`EXPECTED_${fieldName}`, 'text')
    }

    // Add extra output fields
    for (const fieldName of job.outputFieldNames()) {
      this._addField(`${fieldName}`, 'text')
    }
    this._addField('ERROR', 'text')
    this._addField('LOG_URL', 'text')

    const tableSQL = `CREATE TABLE ${this.tableName} (${this.fields.map(f => f.name + ' ' + f.type).join(',\n')})`
    let tableExists = false
    try {
      await this._run(tableSQL)
    } catch (e) {
      // Check if the table already exists, and print a message if so
      if (!e.message.includes('already exists')) {
        throw e
      } else {
        tableExists = true
      }
    }

    if (tableExists) {
      // Loop through all the fields, and see that they are all on the table
      for (const field of this.fields) {
        if (!await this._hasColumn(field.name)) {
          console.info('SQLPRINTER SETUP add column: ' + field.name)
          const sql = `ALTER TABLE ${this.tableName} ADD ${field.name} ${field.type}`
          await this._run(sql)
        }
      }
    }
  }

  _query (sql) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, function (error, rows) {
        if (error) {
          console.error('SQLITE ALL ERROR ' + error)
          reject(error)
          return
        }
        console.log('SQLITE ALL rows: ' + rows.length)
        resolve(rows)
      })
    })
  }

  async _hasColumn (columnName) {
    const rows = await this._query(`PRAGMA table_info('${this.tableName}');`)
    const columnNames = rows.map(r => r.name)
    return columnNames.includes(columnName)
  }

  _prepare (sql) {
    return new Statement(this, sql)
  }

  _run (sql) {
    return new Promise((resolve, reject) => {
      console.info('SQLITE RUN sql ' + sql)
      this.db.run(sql, function (error) {
        if (error) {
          console.error('SQLITE RUN ERROR ' + error + ' on sql: ' + sql)
          reject(error)
          return
        }
        console.log('SQLITE RUN sql: ' + sql + ' changes: ' + this.changes)
        resolve(this)
      })
    })
  }

  _addField (fieldName, type) {
    fieldName = this._name(fieldName)
    this.fields.push({
      name: fieldName,
      type: type
    })
  }

  _name (fieldName) {
    fieldName = fieldName.split(' ').join('_').toUpperCase()
    fieldName = fieldName.split('/').join('_').toUpperCase()
    fieldName = fieldName.split('-').join('_').toUpperCase()

    // Replace keywords
    if (fieldName === 'PRIMARY') {
      fieldName = 'IS_PRIMARY'
    }
    return fieldName
  }
}

class Statement {
  constructor (printer, sql) {
    this.printer = printer
    this.sql = sql
    this.statement = printer.db.prepare(sql)
  }

  async run (params) {
    return new Promise((resolve, reject) => {
      this.statement.run(params, function (error) {
        if (error) {
          console.error('SQLITE RUN ERROR ' + error)
          reject(error)
          return
        }
        console.log('SQLITE RUNSTATEMENT changes: ' + this.changes)
        resolve(this)
      })
    })
  }

  async finalize () {
    return new Promise((resolve, reject) => {
      this.statement.finalize((error) => {
        if (error) {
          console.error('SQLITE FINALIZE ERROR: ' + error)
          reject(error)
        }

        console.info('SQLITE FINALIZE')
        resolve()
      })
    })
  }
}

SQLPrinter.Statement = Statement
module.exports = SQLPrinter
// TODO
// Add timestamp for file to each record? or just add to table?
// What happens on reimporting with file changes?
