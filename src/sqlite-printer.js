const sqlite3 = require('sqlite3').verbose()

/**
 * Sends results of tests to SQLite database
 */
class SQLPrinter {
  constructor () {
    this._connect()
  }

  async drop () {
    await this._run('DROP TABLE results')
  }

  _connect () {
    this.db = new sqlite3.Database('output/results.db')
    this.fields = []
  }

  async print (job) {
    this._connect()
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

    const tableSQL = `CREATE TABLE results (${this.fields.map(f => f.name + ' ' + f.type).join(',\n')})`
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
          const sql = `ALTER TABLE results ADD ${field.name} ${field.type}`
          await this._run(sql)
        }
      }
    }

    const insertSQL = `INSERT INTO results (${this.fields.map(f => f.name).join(',\n')}) values (${this.fields.map(f => '?').join(', ')})`
    console.log('SQLLITE PRINT insert-sql: ' + insertSQL)
    const statement = this.db.prepare(insertSQL)
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
        const expected = result.outputFields[fieldName]
        params.push(expected)
      }
      params.push(result.error)

      await this._runStatement(statement, params)

      // // Push a link to the logs
      // const index = resultsArray.length - 1
      // resultArray.push(`${Store.instance().logURL(job, index)}`)

      // resultsArray.push(resultArray)
    }

    return new Promise((resolve, reject) => {
      statement.finalize((error) => {
        if (error) {
          console.error('SQLITE FINALIZE ERROR: ' + error)
          reject(error)
        }

        console.info('SQLITE FINALIZE')
        resolve()
      })
    })
  }

  _all (sql) {
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
    const rows = await this._all('PRAGMA table_info(results);')
    const columnNames = rows.map(r => r.name)
    return columnNames.includes(columnName)
  }

  _run (sql) {
    return new Promise((resolve, reject) => {
      console.info('SQLITE RUN sql ' + sql)
      this.db.run(sql, function (error) {
        if (error) {
          console.error('SQLITE RUN ERROR ' + error)
          reject(error)
          return
        }
        console.log('SQLITE RUN sql: ' + sql + ' changes: ' + this.changes)
        resolve(this)
      })
    })
  }

  _runStatement (ps, params) {
    return new Promise((resolve, reject) => {
      ps.run(params, function (error) {
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
    return fieldName
  }
}

module.exports = SQLPrinter
// TODO
// Add timestamp for file to each record? or just add to table?
// What happens on reimporting with file changes?
