const _ = require('lodash')
const Message = require('./message')
const RecognitionResult = require('./recognition-result')

/**
 *
 */
class Recognition {
  /**
   * 
   * @param {any} o 
   * @returns {Recognition}
   */
  static fromJSON(o) {
    const recognition = new Recognition(Message.fromJSON(o.message), o.raw, o.type)
    recognition.results = o.results.map(r => RecognitionResult.fromJSON(r))
    _.defaults(recognition, o)
    return recognition
  }

  /**
   * 
   * @param {Message} message 
   * @param {any} raw
   * @param {string} type
   */
  constructor(message, raw, type) {
    this.message = message
    this.raw = raw
    this.type = type
    
    /**
     * @type {RecognitionResult[]}
     */
    this.results = []

    this.timedOut = false

    /** @type {RecognitionResult | undefined} */
    this._topResult = undefined
  }

  /**
   * 
   * @param {RecognitionResult} result 
   * @returns {void}
   */
  addResult(result) {
    this.results.push(result)
  }

  /**
   * @param {boolean} timedOut
   * @returns {Recognition}
   */
  setTimedOut(timedOut) {
    this.timedOut = timedOut
    return this
  }

  /**
   * @returns {RecognitionResult[]}
   */
  sort() {
    return this.results.sort((r1, r2) => r2.confidence - r1.confidence)
  }

  /**
   * We can override the top result
   * @param {RecognitionResult} result
   * @returns {Recognition}
   */
  setTopResult(result) {
    this._topResult = result
    return this
  }

  /**
   * @returns {RecognitionResult | undefined}
   */
  topResult() {
    if (this._topResult) {
      return this._topResult
    }

    if (this.results.length === 0) {
      return undefined
    }
    return this.results.sort()[0]
  }
}



module.exports = Recognition