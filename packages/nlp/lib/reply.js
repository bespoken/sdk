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
  
    /** @type {Recognition | undefined} */
    this.recognition = interpretation?.recognition ? interpretation?.recognition : undefined

    /** @type {string | undefined} */
    this.text = undefined
    
    /** @type {Audio | undefined} */
    this.audio = undefined

    /** @type {InputSettings | undefined} */
    this.inputSettings = undefined
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
   * @param {Recognition} recognition 
   * @returns {Reply}
   */
  setRecognition(recognition) {
    this.recognition = recognition
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

  /**
   * Strips the opening and closing speak from the text, if present
   * @returns {string | undefined}
   */
  textWithoutSSML() {
    let text = this.text
    if (text) {
      text = text.replace('<speak>', '')
      text = text.replace('</speak>', '')
    }
    return text
  }
}

module.exports = Reply