const _ = require('lodash')
const Config = require('@bespoken-sdk/shared/lib/config')
const JSONUtil = require('@bespoken-sdk/shared/lib/json-util')

/** 
 * // Add private so that we do not get an error on generating docs
 * @private @typedef {import('./record')} Record 
 */


/**
 * The result for a particular record
 */
 class Result {
  /**
   * @param {Record} record
   * @param {any} o
   * @returns {Result}
   */
  static fromJSON (record, o) {
    const result = new Result(record, o.voiceId, o.responses)
    JSONUtil.fromJSON(result, o)
    result._record = record
    return result
  }
  /**
   *
   * @param {Record} record
   * @param {string} [voiceId]
   * @param {Object[]} [responses]
   * @param {number} [retryCount]
   */
  constructor (record, voiceId, responses, retryCount = 0) {
    this._record = record
    this._voiceId = voiceId
    this._responses = responses ? responses : []
    this._retryCount = retryCount

    /** @type {Object<string, string>} */
    this._actualFields = {}

    /** @type {Object<string, string>} */
    this._outputFields = {}
    
    /** @type {Object<string, string>} */
    this._tags = {}
    
    this._timestamp = Date.now()
    this._shouldRetry = false
    this._success = false
  }

  /**
   *
   * @param {string} field
   * @returns {string} The value for the field
   */
  actualField (field) {
    return this._actualFields[field]
  }

  /**
   * Adds the actual value for an expected field to the result
   * @param {string} field The name of the field
   * @param {string} value The value of the field
   * @returns {void}
   */
  addActualField (field, value) {
    this._actualFields[field] = value
  }

  /**
   * Adds a field to the output results - these are fields that are not expected or actual but are helpful info about the record
   * @param {string} field The name of the field
   * @param {string} value The value of the field
   * @returns {void}
   */
  addOutputField (field, value) {
    this._outputFields[field] = value
  }

  /**
   * @param {string} key
   * @param {string} value
   * @returns {void}
   */
  addTag (key, value) {
    this._tags[key] = value
  }

  /**
   * Gets a specific output field
   * @param {string} field
   * @returns {string} The value of the field
   */
  outputField (field) {
    return this.outputFields[field]
  }

  /**
   * @returns {any}
   */
  toJSON() {
    return JSONUtil.toJSON(this)
  }

  /**
   * @returns {Object<string, string>}
   */
  get actualFields () {
    return this._actualFields
  }

  /**
   * @returns {string | undefined}
   */
  get error () {
    return this._error
  }
  
  /**
   *
   */
  set error (error) {
    this._error = error
  }

  /**
   * @returns {any}
   */
  get lastResponse () {
    return _.nth(this.responses, -1)
  }

  /**
   * @returns {any[]}
   */
  get responses () {
    return this._responses
  }

  /**
   * @returns {Object<string, string>}
   */
  get outputFields () {
    // We concatenate the output fields from the record and the result
    /** @type {Object<string, string>} */
    const outputFields = {}
    if (this.record) {
      Object.assign(outputFields, this.record.outputFields)
    }
    Object.assign(outputFields, this._outputFields)
    return outputFields
  }

  /**
   * @returns {Record}
   */
  get record () {
    return this._record
  }

  /**
   * @returns {string[]}
   */
  get sanitizedOcrLines () {
    const homophones = Config.get('homophones', false, {})
    const ocrLines = _.get(this.lastResponse, 'raw.ocrJSON.TextDetections', [])
      .filter(text => text.Type === 'LINE')

    Object.keys(homophones).forEach(expectedString => {
      homophones[expectedString].forEach(homophone => {
        ocrLines.forEach((item, index) => {
          ocrLines[index].DetectedText = item.DetectedText.replace(new RegExp(homophone, 'gi'), expectedString)
        })
      })
    })

    return ocrLines
  }

  /**
   * @type {boolean}
   */
  get success () {
    return this._success
  }

  /**
   *
   */
  set success (success) {
    this._success = success
  }

  /**
   * @returns {Object<string, string>}
   */
  get tags () {
    return this._tags
  }

  /**
   * @returns {number}
   */
  get timestamp () {
    return this._timestamp
  }

  /**
   * @returns {boolean}
   */
  get shouldRetry () {
    return this._shouldRetry
  }

  /**
   *
   */
  set shouldRetry (shouldRetry) {
    this._shouldRetry = shouldRetry
  }

  /**
   * @returns {number}
   */
  get retryCount () {
    return this._retryCount
  }

  /**
   *
   */
  set retryCount (retryCount) {
    this._retryCount = retryCount
  }

  /**
   * @type {string | undefined}
   */
  get voiceId() {
    return this._voiceId
  }

  /**
   * @returns {string}
   */
  toString() {
    return JSON.stringify(this, (key, value) => {
      if (key === 'ocrGrid') {
        return '[SKIPPED]'
      } else {
        return value
      }
    }, 2)
  }
}

module.exports = Result