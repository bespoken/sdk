const Config = require('./config')

/**
 * Abstract class that defines contract for record sources
 */
class Source {
  /**
   * Gets the source singleton
   * @returns {Source}
   */
  static instance () {
    return Config.instance('source', undefined, 'csv-source')
  }

  /**
   * Loads all records - this function must be implemented by subclasses
   * @returns {Promise<Record[]>} The records to be processed
   */
  async loadAll () {
    throw new Error('No-op - must be implemented by subclass')
  }

  /**
   * Called just before the record is processed - for last minute operations
   * @param {Record} record
   * @returns {Promise<void>}
   */
  async loadRecord (record) {
    return Promise.resolve()
  }
}

/**
 * Individual records to be processed
 */
class Record {
  /**
   * Creates a record
   * @param {string} utterance The utterance to be sent to the voice experience being tested
   * @param {Object.<string, string>} [expectedFields = {}] The expected values for the record
   * @param {Object} [meta] Additional info about the record to be used in processing
   */
  constructor (utterance, expectedFields = {}, meta) {
    this._utterance = utterance
    this._utteranceRaw = utterance // Save off the original utterance in case we change it during processing
    this._expectedFields = expectedFields
    this._meta = meta
  }

  /**
   * Adds an expected field to the record
   * @param {string} name
   * @param {string} value
   */
  addExpectedField (name, value) {
    this._expectedFields[name] = value
  }

  /**
   * @returns {Object.<string, string>} The expected values for the record
   */
  get expectedFields () {
    return this._expectedFields
  }

  /**
   * Additional info about the record to be used in processing
   * @returns {Object}
   */
  get meta () {
    return this._meta
  }

  set meta (object) {
    this._meta = object
  }

  /**
   * The original utterance
   * @returns {string}
   */
  get utteranceRaw () {
    return this._utteranceRaw
  }

  /**
   * Getter and setter for the utterance
   */
  get utterance () {
    return this._utterance
  }

  set utterance (utterance) {
    this._utterance = utterance
  }
}
module.exports = { Source, Record }
