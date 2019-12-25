const Config = require('./config')
const Record = require('./source').Record
const Result = require('./job').Result
/**
 * The interceptor is responsible for allowing customization of the batch runner behavior
 */
class Interceptor {
  static instance () {
    return Config.instance('interceptor', undefined, 'interceptor', false)
  }

  /**
   * Allows for the input record to be manipulated before being processed
   * @param {Record} record
   * @returns {Promise<boolean>} True to include the record, false to exclude it
   */
  async interceptRecord (record) {
    return true
  }

  /**
   * Allows for making changes to a result after it has been processed
   * @param {Record} record
   * @param {Result} result
   * @returns {Promise<boolean>} True to include the record, false to exclude it
   */
  async interceptResult (record, result) {
    return true
  }
}

module.exports = Interceptor
