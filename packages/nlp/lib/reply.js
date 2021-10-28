const Audio = require('./audio')
const DTO = require('./dto')
const Interpretation = require('./interpretation')
const Message = require('./message')
const Recognition = require('./recognition')

/**
 *
 */
class Reply extends DTO {
  /**
   * 
   * @param {Interpretation} [interpretation]
   */
  constructor(interpretation) {
    super()
    /** @type {Interpretation} */
    this.interpretation = interpretation
    /** @type {string} */
    this.text = undefined
    /** @type {Audio} */
    this.audio = undefined
  }

  /**
   * @returns {Message}
   */
  get message () {
    return this.interpretation.message
  }

  /**
   * @returns {Recognition}
   */
  get recognition () {
    return this.interpretation.recognition
  }

  /**
   * @param {Interpretation} interpretation 
   * @returns {Reply}
   */
  setInterpretation(interpretation) {
    this.interpretation = interpretation
    return this
  }

  /**
   * @param {Audio} audio
   * @returns {Reply}
   */
  setAudio(audio) {
    this.audio = audio
    return this
  }

  /**
   * @param {string} text
   * @returns {Reply}
   */
  setText(text) {
    this.text = text
    return this
  }
}

module.exports = Reply