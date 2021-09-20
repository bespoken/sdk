const _ = require('lodash')
const Chalk = require('chalk')
const Moment = require('moment')
// const Util = require('./util')

/**
 *
 */
class Logger {
  /**
   * @param {string} [name]
   * @returns {Logger}
   */
  static logger (name = 'DFLT') {
    return new Logger(name)
  }

  /**
   *
   * @param {string} name
   */
  constructor (name) {
    this.name = _.toUpper(name)
    /** @type {Object.<string, number>} */
    this.timers = {}
  }

  /**
   * @param {boolean} condition
   * @param {string} description
   * @returns {void}
   */
  assert (condition, description) {
    if (!condition) {
      throw new Error(description)
    }
  }

  /**
   * @param {string} log
   * @returns {void}
   */
  debug (log) {
    if (!process.env.SILENT && (process.env.DEBUG || process.env.TRACE)) {
      this.log('DEBUG', Chalk.rgb(255, 102, 0), log)
    }
  }

  /**
   * @param {string} log
   * @returns {void}
   */
  trace (log) {
    if (!process.env.SILENT && process.env.TRACE) {
      this.log('TRACE', Chalk.yellow, log)
    }
  }

  /**
   * @param {string} log
   * @returns {void}
   */
  error (log) {
    this.log('ERROR', Chalk.red, log)
  }

  /**
   * @param {string} log
   * @returns {void}
   */
  info (log) {
    if (!process.env.SILENT) {
      this.log('INFO', Chalk.cyan, log)
    }
  }

  /**
   * @param {string} level
   * @param {Chalk.Chalk} color
   * @param {string} log
   * @returns {void}
   */
  log (level, color, log) {
    var local = Moment().format('hh:mm:ss.SSS') // today (local time)
    this._write(level, `${color(_.padEnd(level, 5))} ${local} ${Chalk.magenta(_.padEnd(this.name, 6))} ${color(log)}\n`)
  }

  /**
   * @param {string} name
   * @returns {void}
   */
  time (name) {
    this.timers[name] = Date.now()
  }

  /**
   *
   * @param {string} name
   * @param {number} [warningThreshold]
   * @returns {void}
   */
  timeEnd (name, warningThreshold = 1000) {
    const endTime = Date.now()
    if (name in this.timers) {
      const startTime = this.timers[name]
      const totalTime = endTime - startTime
      if (totalTime > warningThreshold) {
        this.warn(`${name} ${totalTime} ms`)
      } else {
        this.debug(`${name} ${totalTime} ms`)
      }
      delete this.timers[name]
    } else {
      this.info(`No match for timer: ${name}`)
    }
  }

  /**
   * @param {string} log
   * @returns {void}
   */
  warn (log) {
    this.log('WARN', Chalk.yellow, log)
  }

  /**
   * @returns {boolean}
   */
  _isBrowser () {
    // @ts-ignore
    return global.window !== undefined
  }

  /**
   * @param {string} level
   * @param {string} s
   * @returns {Promise<void>}
   */
  async _write (level, s) {
    return new Promise((resolve) => {
      if (!this._isBrowser() || process.env.NODE_ENV === 'test') {
        process.stdout.write(s, 'utf-8', (error) => {
          if (error) {
            console.error('Error flushing data: ' + error)
          }
          resolve()
        })
      } else {
        if (level === 'INFO') {
          console.info(s)
        } else if (level === 'ERROR') {
          console.error(s)
        } else {
          console.debug(s)
        }
      }
    })
  }
}

if (process.env.SILENT) {
  console.timeEnd = () => {}
}
module.exports = Logger.logger