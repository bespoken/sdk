const _ = require('lodash')
const Entity = require('./entity')
const Intent = require('./intent')
const Message = require('./message')
const Persistable = require('./persistable')
const Recognition = require('./recognition')

/** @typedef {('LEX' | 'NOOP' | 'VOICEFLOW')} InterpreterType  */

/**
 * Holds results from NLU
 */
class Interpretation extends Persistable {
  /**
   * @param {any} o
   * @returns {Interpretation | undefined}
   */
  static fromJSON(o) {
    if (!o) {
      return undefined
    }

    const interpretation = new Interpretation(Message.fromJSON(o.message), o.raw, o.type)
    _.defaults(interpretation, o)
    return interpretation
  }

  /**
   * 
   * @param {Message} message 
   * @param {any} raw
   * @param {InterpreterType} type
   * @param {Intent} [intent]
   */
  constructor(message, raw, type, intent) {
    super()
    this.message = message
    this.raw = raw
    this.type = type
    this.intent = intent

    /** @type {Recognition | undefined} */
    this.recognition = undefined

    /** @type {Entity[]} */
    this.entities = []
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
   * @param {Recognition} recognition
   * @returns {Interpretation}
   */
  setRecognition(recognition) {
    this.recognition = recognition
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