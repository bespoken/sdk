/**
 *
 */
class Transcription {
  constructor() {
    /**
     * @type {TranscriptionResult[]}
     */
    this.results = []
  }

  /**
   * 
   * @param {TranscriptionResult} result 
   * @returns {void}
   */
  addResult(result) {
    this.results.push(result)
  }

  /**
   * @returns {TranscriptionResult[]}
   */
  sort() {
    return this.results.sort((r1, r2) => r2.confidence - r1.confidence)
  }

  /**
   * @returns {TranscriptionResult | undefined}
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
class TranscriptionResult {
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

module.exports = { Transcription, TranscriptionResult }