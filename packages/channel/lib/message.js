const Audio = require('./audio')
/**
 *
 */
class Message {

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