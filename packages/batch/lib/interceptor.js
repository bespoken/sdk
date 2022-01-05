const Config = require('@bespoken-sdk/shared/lib/config')
const Device = require('./device').Device
const Job = require('./job')
const logger = require('@bespoken-sdk/shared/lib/logger')('INTER')
const Record = require('./record')
const Result = require('./result')

/**
 * The interceptor is responsible for allowing customization of the batch runner behavior
 */
class Interceptor {
  /**
   * @returns {Interceptor}
   */
  static instance () {
    return Config.instance('interceptor', Interceptor)
  }

  /**
   * Allows for the input record to be manipulated before being processed
   * @param {Record} record
   * @returns {Promise<boolean>} True to include the record, false to exclude it
   */
  async interceptRecord (record) {
    logger.debug('intercepting record: ' + record.utterance)
    return true
  }

  /**
   * Allows for making changes to a result after it has been processed
   * @param {Record} record
   * @param {Result} result
   * @returns {Promise<boolean>} True to include the record, false to exclude it
   */
  async interceptResult (record, result) {
    logger.debug('intercepting result: ' + result.record.utterance)
    return true
  }

  /**
   * Allows for making changes to a result after it has an error
   * @param {Record} record
   * @param {Result} result
   * @returns {Promise<void>} Void promise
   */
  async interceptError (record, result) {
    logger.debug('intercepting error: ' + record.utterance + ' for result: ' + result)
  }

  /**
   * Allows for calling custom code before the execution of the tests begin
   * @param {Job} job
   * @returns {Promise<void>} Void promise
   */
  async interceptPreProcess (job) {
    logger.debug('intercepting preprocess: ' + job)
  }

  /**
   * Allows for making changes to a result after it has been processed
   * @param {Job} job
   * @returns {Promise<void>} Void promise
   */
  async interceptPostProcess (job) {
    logger.debug('intercepting postprocess: ' + job)
  }

  /**
   * Allows for making changes to a request payload
   * @param {Record} record the record associated with this request
   * @param {Object} request payload
   * @param {Device} device the device making the request
   * @returns {Promise<void>} Void promise
   */
  async interceptRequest (record, request, device) {
    logger.debug('intercepting request: ' + record.utterance + ' request: ' + request + ' device: ' + device)
  }
}

module.exports = Interceptor
