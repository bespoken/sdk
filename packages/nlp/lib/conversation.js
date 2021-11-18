const DTO = require('./dto')
const Settings = require('./settings')

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
    
    /** @type {Object<string, any>} */
    this.context = {}
    
    /** @type {string | undefined} */
    this.phoneNumber = undefined

    /** @type {Settings} */
    this.settings = new Settings({})
  }

   /**
   * @param {string} key
   * @returns {string | undefined}
   */
  contextString(key) {
    return this.context[key]
  }

  /**
   * @param {string} key
   * @returns {any | undefined}
   */
  contextValue(key) {
    return this.context[key]
  }
}

module.exports = Conversation