const Job = require('./job')
const mysql = require('mysql')
const SQLPrinter = require('./sql-printer')

/**
 *
 */
class MySQLPrinter extends SQLPrinter {
  /**
   * @param {Job} job
   * @returns {Promise<void>}
   */
  async print (job) {
    // Allow for the table name to be set by environment variable
    // If not present, uses the job name
    this.tableName = process.env.MYSQL_TABLE ? process.env.MYSQL_TABLE : this._name(job.name)
    try {
      return await super.print(job, true)
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
   * @returns {Promise<SQLPrinter>}
   */
  async reset (job) {
    await this._query(`DELETE FROM ${this.tableName} WHERE RUN = ?`, [job.run])
    return this
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
}

/**
 *
 */
class Statement extends SQLPrinter.Statement {
  constructor (printer, sql) {
    super(printer, sql)
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

module.exports = MySQLPrinter
