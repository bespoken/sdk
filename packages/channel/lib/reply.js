const DTO = require('./dto')
const Interpretation = require('./interpretation')
const Message = require('./message')
const Recognition = require('./recognition')

/**
 *
 */
class Reply extends DTO {
  /**
   * 
   * @param {Message} [message]
   */
  constructor(message) {
    super()
    this.message = message
    /** @type {Recognition} */
    this.recognition = undefined
    /** @type {Interpretation} */
    this.interpretation = undefined
    /** @type {string} */
    this.responseText = undefined
  }

  /**
   * @param {string} text
   * @returns {Reply}
   */
  setResponseText(text) {
    this.responseText = text
    return this
  }

  /**
   * @param {Recognition} value
   * @returns {Reply}
   */
   setRecognition(value) {
    this.recognition = value
    return this
  }
}

module.exports = Reply