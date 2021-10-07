const Audio = require('./audio')
const Conversation = require('./conversation')
const DTO = require('./dto')

/**
 *
 */
class Message extends DTO{
  /**
   * 
   * @param {Conversation} conversation
   * @param {string} text
   * @returns {Message} 
   */
  static fromText(conversation, text) {
    const message = new Message(conversation)
    message.text = text
    return message
  }

  /**
   * @param {Conversation} conversation
   * @param {string} audio
   * @returns {Message} 
   */
   static fromAudioBase64(conversation, audio) {
    const message = new Message(conversation)
    const audioBuffer = Buffer.from(audio, 'base64')
    message.audio = new Audio(audioBuffer)
    return message
  }

  /**
   * @param {Conversation} conversation
   * @param {Buffer} audio
   * @returns {Message} 
   */
   static fromAudioBuffer(conversation, audio) {
    const message = new Message(conversation)
    message.audio = new Audio(audio)
    return message
  }

  /**
   * @param {Conversation} conversation
   */
  constructor(conversation) {
    super()
    
    this.conversation = conversation
    /**
     * @type {Audio}
     */
    this.audio = undefined

    this.locale = 'en-US'
    
    /**
     * @type {string}
     */
    this.text = undefined
  }

  /**
   * Clones the message object
   * @returns {Message}
   */
  clone() {
    const message = new Message(this.conversation)
    Object.assign(message, this)
    return message
  }
}

module.exports = Message