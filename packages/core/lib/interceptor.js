const Config = require('./config')
const Record = require('./source').Record
const Result = require('./job').Result

/**
 * The interceptor is responsible for allowing customization of the batch runner behavior
 */
class Interceptor {
  static instance () {
    return Config.instance('interceptor', Interceptor)
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

  /**
   * Allows for making changes to a result after it has an error
   * @param {Record} record
   * @returns {Promise<Undefined>} Void promise
   */
  async interceptError (record) {
  }

  /**
   * Allows for calling custom code before the execution of the tests begin
   * @param {Job} job
   * @returns {Promise<Undefined>} Void promise
   */
  async interceptPreProcess (job) {

  }

  /**
   * Allows for making changes to a result after it has been processed
   * @param {Job} job
   * @returns {Promise<Undefined>} Void promise
   */
  async interceptPostProcess (job) {

  }

  /**
   * Allows for making changes to a request payload
   * @param {Record} the record associated with this request
   * @param {Object} request payload
   * @param {Device} the device making the request
   * @returns {Promise<Undefined>} Void promise
   */
  async interceptRequest (record, request, device) {

  }
}

module.exports = Interceptor
