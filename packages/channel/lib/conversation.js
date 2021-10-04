const DTO = require('./dto')

/** @typedef {('TWILIO')} ChannelType */

/**
 * Manages the conversation between a user and a bot
 */
class Conversation extends DTO {
  /**
   * @param {any} raw
   * @param {ChannelType} channelType
   * @param {string} externalID 
   */
  constructor(raw, channelType, externalID) {
    super()

    this.raw = raw
    this.channelType = channelType
    this.externalID = externalID
    
    /** @type {string} */
    this.phoneNumber = undefined
  }
}

module.exports = Conversation