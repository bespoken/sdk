const JSONUtil = require('@bespoken-sdk/shared/lib/json-util')

/**
 * Individual records to be processed
 */
 class Record {
  /**
   * @param {any} o
   * @returns {Record}
   */
  static fromJSON (o) {
    const record = new Record(o.utterance)
    JSONUtil.fromJSON(record, o)
    return record
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

    /** @type {Object<string, any>} */
    this._settings = {}
  }

  /**
   * Device tags indicate that a record can ONLY be run on a device with this tag
   * @param {string} tag
   * @returns {void}
   */
  addDeviceTag (tag) {
    this._deviceTags.push(tag)
  }

  /**
   * Adds an expected field to the record
   * @param {string} name
   * @param {string} value
   * @returns {void}
   */
  addExpectedField (name, value) {
    this._expectedFields[name] = value
  }

  /**
   * Adds an output field to the record
   * @param {string} name
   * @param {string} value
   * @returns {void}
   */
  addOutputField (name, value) {
    this._outputFields[name] = value
  }

  /**
   *
   * @param {string} name
   * @param {string} setting
   * @returns {void}
   */
  addSetting (name, setting) {
    this._settings[name] = setting
  }

  /**
   * @param {string} name
   * @returns {void}
   */
  outputField (name) {
    return this._outputFields[name]
  }

  /**
   * @returns {any}
   */
  toJSON() {
    return JSONUtil.toJSON(this)
  }

  /**
   * Property to get the latest conversation id while processing the record
   * @type {Object}
   */
  get conversationId () {
    return this._conversationId
  }

  /**
   *
   */
  set conversationId (conversationId) {
    this._conversationId = conversationId
  }

  /**
   * Gets the device tags associated with this record
   * @type {string[]}
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
   * Getter and setter for the locale
   * @type {string | undefined}
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
   * Property for additional info to be set on the record
   * @type {Object}
   */
  get meta () {
    return this._meta
  }

  /**
   *
   */
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
   * Whether this record is being rerun
   * @type {boolean}
   */
  get rerun () {
    return this._rerun
  }

  /**
   *
   */
  set rerun (rerun) {
    this._rerun = rerun
  }

  /**
   * @returns {Object<string, any> | undefined}
   */
  get settings () {
    return this._settings
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
   * @type {string | undefined}
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

module.exports = Record