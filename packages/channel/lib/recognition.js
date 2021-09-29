/**
 *
 */
class Recognition {
  constructor() {
    /**
     * @type {RecognitionResult[]}
     */
    this.results = []
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
   * @returns {RecognitionResult[]}
   */
  sort() {
    return this.results.sort((r1, r2) => r2.confidence - r1.confidence)
  }

  /**
   * @returns {RecognitionResult | undefined}
   */
  topResult() {
    if (this.results.length === 0) {
      return undefined
    }
    return this.results.sort()[0]
  }
}

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

module.exports = { Recognition, RecognitionResult }