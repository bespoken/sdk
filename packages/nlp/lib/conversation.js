// We do not actually import Reply because it makes this circular
/** @typedef {import('./reply')} Reply */
const _ = require('lodash')
const Persistable = require('./persistable')

/** @typedef {('DIRECT' | 'TELNYX' | 'TWILIO')} ChannelType */

/**
 * Manages the conversation between a user and a bot
 */
class Conversation extends Persistable {
  /**
   * @param {any} o
   * @returns {Conversation}
   */
  static fromJSON(o) {
    const conversation = new Conversation(o.raw, o.channelType, o.externalID)
    Object.assign(conversation, o)
    return conversation
  }
  
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

  /**
   * @returns {any}
   */
   toJSON() {
    const clone = _.defaultsDeep({}, this)
    //console.info('reply tojson: ' + clone?.message?.conversation?.replies?.length)
    delete clone.replies 
    return clone
  }
}

module.exports = Conversation