const Entity = require('./entity')
const Intent = require('./intent')
const Message = require('./message')

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
}

module.exports = Interpretation