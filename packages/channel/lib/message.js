const Audio = require('./audio')

/**
 *
 */
class Message {
  /**
   * 
   * @param {string} text
   * @returns {Message} 
   */
  static fromText(text) {
    const message = new Message()
    message.text = text
    return message
  }

  /**
   * 
   * @param {string} audio
   * @returns {Message} 
   */
   static fromAudioBase64(audio) {
    const message = new Message()
    const audioBuffer = Buffer.from(audio, 'base64')
    message.audio = new Audio(audioBuffer)
    return message
  }

  /**
   * 
   * @param {Buffer} audio
   * @returns {Message} 
   */
   static fromAudioBuffer(audio) {
    const message = new Message()
    message.audio = new Audio(audio)
    return message
  }

  constructor() {
    /**
     * @type {Audio}
     */
    this.audio = undefined

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
    const message = new Message()
    Object.assign(message, this)
    return message
  }
}

module.exports = Message