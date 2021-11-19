const DTO = require('./dto')
const Reply = require('./reply')
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

    /** @type {Reply[]} */
    this.replies = []
  }

  /**
   * @param {Reply} reply
   * @returns {Conversation}
   */
  addReply(reply) {
    this.replies.push(reply)
    return this
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

  /**
   * @returns {Reply | undefined}
   */
  lastReply() {
    return this.replies.length > 0 ? this.replies[this.replies.length - 1] : undefined
  }
}

module.exports = Conversation