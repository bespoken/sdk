const _ = require('lodash')
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
    return Config.instance('source', './csv-source')
  }

  /**
   * Filters records based on configuration
   * The filters are set in the config as a key and set of values, such as:
   * ```
   * filters: {
   *   property: ['value1', 'value2'],
   * }
   * ```
   * The property is taken from the `meta` attribute of the record
   * @param {Record[]} records
   * @returns {Record[]} The records after the filter is applied
   */
  filter (records) {
    if (Config.has('filters')) {
      const filteredRecords = []
      const filters = Config.get('filters')
      console.log(`FILTER properties: ${Object.keys(filters)}`)

      // Apply the filter to the records
      for (const record of records) {
        let match = true
        for (const filterProperty of Object.keys(filters)) {
          let values = filters[filterProperty]
          // If the values element is not an array, make it into one
          if (!Array.isArray(values)) {
            values = [values]
          }

          let value = _.get(record.meta, filterProperty)
          if (!value) {
            console.log(`FILTER skipping: ${record.utterance} reason: ${filterProperty} is undefined`)
            match = false
            break
          }

          value += '' // Turn everything into a string for ease of comparison
          match = values.find(v => {
            v += ''
            return v.trim().toLowerCase() === value.trim().toLowerCase()
          })

          if (!match) {
            console.log(`FILTER skipping: ${record.utterance} reason: ${filterProperty} = ${value}`)
            break
          }
        }

        if (match) {
          filteredRecords.push(record)
        }
      }
      return filteredRecords
    } else {
      return records
    }
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
  static fromJSON (o) {
    if (o) {
      const record = new Record()
      Object.assign(record, o)
      return record
    } else {
      return undefined
    }
  }

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
    this._outputFields = {}
    this._meta = meta
    this._deviceTags = []
    this._conversationId = undefined
    this._locale = undefined
    this._voiceID = undefined
    this._rerun = false
  }

  /**
   * Device tags indicate that a record can ONLY be run on a device with this tag
   * @param {string} tag
   */
  addDeviceTag (tag) {
    this._deviceTags.push(tag)
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
   * Adds an output field to the record
   * @param {string} name
   * @param {string} value
   */
  addOutputField (name, value) {
    this._outputFields[name] = value
  }

  outputField (name) {
    return this._outputFields[name]
  }

  /**
   * Gets the device tags associated with this record
   */
  get deviceTags () {
    return this._deviceTags
  }

  /**
   * The expected values for the record
   * @type {Object.<string, string>}
   */
  get expectedFields () {
    return this._expectedFields
  }

  /**
   * Property for additional info to be set on the record
   * @type {Object}
   */
  get meta () {
    return this._meta
  }

  set meta (object) {
    this._meta = object
  }

  /**
   * The output field values for the record - gets combinted with the outputfields on the result
   * @type {Object.<string, string>}
   */
  get outputFields () {
    return this._outputFields
  }

  /**
   * Property to get the latest conversation id while processing the record
   * @type {Object}
   */
  get conversationId () {
    return this._conversationId
  }

  set conversationId (conversationId) {
    this._conversationId = conversationId
  }

  /**
   * Getter and setter for the locale
   * @type {string}
   */
  get locale () {
    return this._locale
  }

  /**
   * @private
   */
  set locale (locale) {
    this._locale = locale
  }

  /**
   * Whether this record is being rerun
   * @type {boolean}
   */
  get rerun () {
    return this._rerun
  }

  set rerun (rerun) {
    this._rerun = rerun
  }

  /**
   * The original utterance
   * @type {string}
   */
  get utteranceRaw () {
    return this._utteranceRaw
  }

  /**
   * Getter and setter for the utterance
   * @type {string}
   */
  get utterance () {
    return this._utterance
  }

  /**
   * @private
   */
  set utterance (utterance) {
    this._utterance = utterance
  }

  /**
   * Getter and setter for the utterance
   * @type {string}
   */
  get voiceID () {
    return this._voiceID
  }

  /**
     * @private
     */
  set voiceID (voiceID) {
    this._voiceID = voiceID
  }
}
module.exports = { Source, Record }
