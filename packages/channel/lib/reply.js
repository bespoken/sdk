const Message = require('./message')
const Transcription = require('./recognition')
const Understanding = require('./understanding')

/**
 *
 */
class Reply {
  /**
   * 
   * @param {Message} message
   */
  constructor(message) {
    this.message = message
    /** @type {Transcription} */
    this.transcription = undefined
    /** @type {Understanding} */
    this.understanding = undefined
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