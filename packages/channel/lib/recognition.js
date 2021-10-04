const DTO = require('./dto')
const Message = require('./message')
const RecognitionResult = require('./recognition-result')
/** @typedef {('AZURE')} RecognizerType  */

/**
 *
 */
class Recognition extends DTO {
  /**
   * 
   * @param {Message} message 
   * @param {any} raw
   * @param {RecognizerType} type
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



module.exports = Recognition