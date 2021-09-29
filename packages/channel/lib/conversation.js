const DTO = require('./dto')

/**
 * Manages the conversation between a user and a bot
 */
class Conversation extends DTO {
  constructor() {
    super()
    /** @type {string} */
    this.dummy = undefined
  }
}

module.exports = Conversation