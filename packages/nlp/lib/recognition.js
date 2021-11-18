const DTO = require('./dto')
const Message = require('./message')
const RecognitionResult = require('./recognition-result')

/**
 *
 */
class Recognition extends DTO {
  /**
   * 
   * @param {Message} message 
   * @param {any} raw
   * @param {string} type
   */
  constructor(message, raw, type) {
    super()
    this.message = message
    this.raw = raw
    this.type = type
    
    /**
     * @type {RecognitionResult[]}
     */
    this.results = []

    this.timedOut = false
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
   * @returns {RecognitionResult | undefined}
   */
  topResult() {
    if (this.results.length === 0) {
      return undefined
    }
    return this.results.sort()[0]
  }
}



module.exports = Recognition