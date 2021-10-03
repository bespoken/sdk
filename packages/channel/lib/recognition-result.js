/**
 *
 */
 class RecognitionResult {
  /**
   * 
   * @param {string} text 
   * @param {number} confidence 
   * @param {any} raw 
   * 
   */
  constructor(text, confidence, raw) {
    this.raw = raw
    this.text = text
    this.confidence = confidence
    /** @type {string} */
    this.textPunctuated = undefined
  }
}

module.exports = RecognitionResult