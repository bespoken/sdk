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
   * @returns {TranscriptionResult}
   */
  topResult() {
    return this.results.sort()[this.results.length - 1]
  }
}

/**
 *
 */
class TranscriptionResult {
  constructor(text, confidence) {
    this.text = text
    this.confidence = confidence
  }
}

module.exports = Transcription