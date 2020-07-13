const SQLPrinter = require('./sqlite-printer')
const mysql = require('mysql')

class MySQLPrinter extends SQLPrinter {
  async print (job) {
    this.tableName = this._name(job.name)
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

  reset (job) {
    return this._query(`DELETE FROM ${this.tableName} WHERE RUN = ?`, [job.run])
  }

  async _connect () {
    this.connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: 'batch-tester'
    })

    return new Promise((resolve, reject) => {
      this.connection.connect((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })
  }

  async _close () {
    return new Promise((resolve, reject) => {
      this.connection.end((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  _query (sql, params) {
    return new Promise((resolve, reject) => {
      // console.info('SQL: ' + sql)
      const options = {
        sql: sql,
        timeout: 40000
      }
      if (params) {
        options.values = params
      }
      this.connection.query(options, (error, results, fields) => {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
          reject(error)
        } else {
          resolve(results)
        }
      })
    })
  }

  async _hasColumn (columnName) {
    if (!this.columnNames) {
      const rows = await this._query(`SHOW COLUMNS FROM ${this.tableName};`)
      // console.info('ROWS: ' + JSON.stringify(rows, null, 2))
      this.columnNames = rows.map(r => r.Field)
    }

    return this.columnNames.includes(columnName)
  }

  _prepare (sql) {
    return new Statement(this, sql)
  }

  _run (sql) {
    return this._query(sql)
  }
}

class Statement {
  constructor (printer, sql) {
    this.printer = printer
    this.sql = sql
  }

  async run (params) {
    return this.printer._query(this.sql, params)
  }

  async finalize () {
    return Promise.resolve()
  }
}

module.exports = MySQLPrinter
