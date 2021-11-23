const _ = require('lodash')
const Persistable = require('./persistable')

/**
 *
 */
class RecognitionResult extends Persistable {
  /**
   * @param {any} o
   * @returns {RecognitionResult}
   */
  static fromJSON(o) {
    const result = new RecognitionResult(o.text, o.confidence, o.index, o.raw)
    _.defaults(result, o)
    return result
  }

  /**
   * 
   * @param {string} text 
   * @param {number} confidence
   * @param {number} index 
   * @param {any} raw 
   * 
   */
  constructor(text, confidence, index, raw) {
    super()
    this.raw = raw
    this.text = text
    this.index = index
    this.confidence = confidence

    /** @type {string | undefined} */
    this.textPunctuated = undefined
  }
}

module.exports = RecognitionResult