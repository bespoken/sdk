const Audio = require('./audio')
const DTO = require('./dto')
const InputSettings = require('./input-settings')
const Interpretation = require('./interpretation')
const Message = require('./message')
const Recognition = require('./recognition')

/**
 *
 */
class Reply extends DTO {
  /**
   * @param {Message} message
   * @param {Interpretation} [interpretation]
   */
  constructor(message, interpretation) {
    super()
    this.message = message
    
    /** @type {Interpretation | undefined} */
    this.interpretation = interpretation
    
    /** @type {string | undefined} */
    this.text = undefined
    
    /** @type {Audio | undefined} */
    this.audio = undefined

    /** @type {InputSettings | undefined} */
    this.inputSettings = undefined
  }

  /**
   * @returns {Recognition | undefined}
   */
  get recognition () {
    return this.interpretation?.recognition
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
   * @param {InputSettings} settings 
   * @returns {Reply}
   */
  setInputSettings(settings) {
    this.inputSettings = settings
    return this
  }

  /**
   * @param {Message} message
   * @returns {Reply}
   */
  setMessage(message) {
    this._message = message
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