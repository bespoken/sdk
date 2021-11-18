const Entity = require('./entity')
const Intent = require('./intent')
const Message = require('./message')
const Recognition = require('./recognition')
const Reply = require('./reply')

/** @typedef {('LEX' | 'NOOP')} InterpreterType  */

/**
 * Holds results from NLU
 */
class Interpretation {
  /**
   * 
   * @param {Message} message 
   * @param {any} raw
   * @param {InterpreterType} type
   * @param {Intent} [intent]
   */
  constructor(message, raw, type, intent) {
    this.message = message
    this.raw = raw
    this.type = type
    this.intent = intent

    /** @type {Reply | undefined} */
    this.reply = undefined

    /** @type {Entity[]} */
    this.entities = []
  }

  /** 
   * @returns {Recognition | undefined} 
   */
  get recognition () {
    return this.message.recognition
  }
  /**
   * 
   * @param {Entity} entity 
   * @returns {Interpretation}
   */
  addEntity(entity) {
    this.entities.push(entity)
    return this
  }

  /**
   * 
   * @param {string} name 
   * @returns {Entity | undefined}
   */
  entity(name) {
    return this.entities.find(e => e.name === name)
  }

  /**
   * @param {Reply} reply
   * @returns {Interpretation}
   */
  setReply(reply) {
    this.reply = reply
    return this 
  }

  /**
   * @param {string} property
   * @returns {any}
   */
  toJSON(property) {
    if (property === 'message') {
      return this.message.toString()
    } else if (!property) {
      return this
    }
    return this[property]
  }
}

module.exports = Interpretation