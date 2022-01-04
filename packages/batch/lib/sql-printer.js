const _ = require('lodash')
const Job = require('./job')
const logger = require('@bespoken-sdk/shared/lib/logger')('SQLPRINT')
const mysql = require('mysql')
/**
 * Sends results of tests to SQLite database
 */
class SQLPrinter {
  /**
   *
   */
  constructor () {
    this.tableName = 'RESULTS'
    this.fields = []
  }

  /**
   * @param {Job} job
   * @returns {Promise<SQLPrinter>}
   */
   async reset (job) {
    await this._query(`DELETE FROM ${this.tableName} WHERE RUN = ?`, [job.run])
    return this
  }

  /**
   * @param {Job} job
   * @returns {Promise<void>}
   */
   async print (job) {
    try {
      return await this.printImpl(job, true)
    } catch (e) {
      console.error('MYSQL-PRINTER PRINT print error: ' + e.toString())
      throw e
    } finally {
      try {
        await this._close()
      } catch (e) {
        console.error('MYSQL-PRINTER PRINT close error: ' + e.toString())
      }
    }
  }
  /**
   * @param {Job} job
   * @param {boolean} reset
   * @returns {Promise<void>}
   */
  async printImpl (job, reset = false) {
    this.tableName = process.env.MYSQL_TABLE ? process.env.MYSQL_TABLE : this._name(job.name)
    this._connect()
    if (reset) {
      try {
        await this.reset(job)
      } catch (e) {
        logger.error('SQL-PRINTER PRINT reset error: ' + e.toString())
      }
    }

    if (this.fields.length === 0) {
      await this._setup(job)
    }

    const insertSQL = `INSERT INTO ${this.tableName} (${this.fields.map(f => f.name).join(',\n')}) values (${this.fields.map(() => '?').join(', ')})`
    logger.debug('SQLLITE PRINT insert-sql: ' + insertSQL)
    const statement = this._prepare(insertSQL)

    let index = 0
    for (const result of job.results) {
      const params = [result.record.utteranceRaw, job.run, job.name, job.timestamp]

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
      params.push(result.error ? result.error : '')

      // Push a link to the logs
      params.push(`${job.logURL(index)}`)

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
  
  /**
   * @returns {Promise<void>}
   */
   async _close () {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        return
      }
      this.connection.end((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

   /**
   * @returns {Promise<void>}
   */
  async _connect () {
    this.connection = mysql.createConnection({
      database: process.env.MYSQL_DATABASE,
      host: process.env.MYSQL_HOST,
      password: process.env.MYSQL_PASSWORD,
      user: process.env.MYSQL_USER,
      
    })

    return new Promise((resolve, reject) => {
      if (!this.connection) throw new Error('No connection created')
      this.connection.connect((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })
  }
  /**
   * @param {Job} job
   * @returns {Promise<void>}
   */
  async _setup (job) {
    this._addField('UTTERANCE', 'text')
    this._addField('RUN', 'text')
    this._addField('JOB', 'text')
    this._addField('TIMESTAMP', 'text')

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

  /**
   * @param {string} sql
   * @param {any[]} [params]
   * @returns {Promise<any[]>}
   */
   _query (sql, params) {
    return new Promise((resolve, reject) => {
      if (params) {
        params = params.map(param => this._value(param))
      }
      // console.info('SQL: ' + sql)
      const options = {
        sql: sql,
        timeout: 40000
      }
      if (params) {
        options.values = params
      }

      if (!this.connection) throw new Error('No connection')
      this.connection.query(options, (error, results) => {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
          if (!sql.includes('CREATE TABLE')) {
            console.error('MYSQL QUERY error on sql: ' + sql)
            if (params) {
              console.error('MYSQL QUERY error on params:' + params.join(',\n'))
            }
          }
          reject(error)
        } else {
          resolve(results)
        }
      })
    })
  }

  /**
   * @param {string} columnName
   * @returns {Promise<boolean>}
   */
   async _hasColumn (columnName) {
    if (!this.columnNames) {
      const rows = await this._query(`SHOW COLUMNS FROM ${this.tableName};`)
      // console.info('ROWS: ' + JSON.stringify(rows, null, 2))
      this.columnNames = rows.map(r => r.Field)
    }

    return this.columnNames.includes(columnName)
  }

  /**
   * @param {string} sql
   * @returns {Statement}
   */
   _prepare (sql) {
    return new Statement(this, sql)
  }

  /**
   * @param {string} sql
   * @returns {Promise<SQLPrinter>}
   */
  async _run (sql) {
    await this._query(sql)
    return this
  }

  /**
   * @param {string} fieldName
   * @param {string} type
   * @returns {void}
   */
  _addField (fieldName, type) {
    fieldName = this._name(fieldName)
    this.fields.push({
      name: fieldName,
      type: type
    })
  }

  /**
   * @param {string} fieldName
   * @returns {string}
   */
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

  // Clean values
  /**
   * @param {any} value
   * @returns {string | undefined}
   */
  _value (value) {
    if (value === undefined) {
      return undefined
    }

    // handle a boolean value
    if (value === false) {
      return 'false'
    } else if (value === true) {
      return 'true'
    }

    // Handle array values
    if (_.isArray(value)) {
      value = value.map(v => v.toString()).join(',')
    }

    // Handle objects
    if (_.isObject(value)) {
      value = value.toString()
    }

    // Escape apostrophes
    if (_.isString(value)) {
      value.split('\'').join('\'\'')
    }
    return value
  }
}

/**
 *
 */
 class Statement {
  constructor (printer, sql) {
    this.printer = printer
    this.sql = sql
  }

  /**
   * @param {any[]} params
   * @returns {Promise<Statement>}
   */
  async run (params) {
    return this.printer._query(this.sql, params)
  }

  /**
   * @returns {Promise<void>}
   */
  async finalize () {
    return Promise.resolve()
  }
}

SQLPrinter.Statement = Statement
module.exports = SQLPrinter
// TODO
// Add timestamp for file to each record? or just add to table?
// What happens on reimporting with file changes?
