const DTO = require('./dto')
const Interpretation = require('./interpretation')
const Message = require('./message')
const Transcription = require('./recognition')

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
    /** @type {Transcription} */
    this.transcription = undefined
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
   * @param {Transcription} value
   * @returns {Reply}
   */
   setTranscription(value) {
    this.transcription = value
    return this
  }
}

module.exports = Reply