const Message = require('./message')
const Transcription = require('./transcription')
const Understanding = require('./understanding')

/**
 *
 */
class Reply {
  /**
   * 
   * @param {Message} message 
   * @param {Transcription} transcription 
   * @param {Understanding} understanding 
   */
  constructor(message, transcription, understanding) {
    this.message = message
    this.transcription = transcription
    this.understanding = understanding
  }
}

module.exports = Reply