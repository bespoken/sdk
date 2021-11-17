/**
 * @enum {string}
 */
const InputType = {
  DTMF: 'DTMF',
  TEXT: 'TEXT',
  VOICE: 'VOICE'
} 

/**
 *
 */
class InputSettings {
  /**
   * @param {InputType} type
   */
  constructor(type) {
    this.type = type

    /** @type {number | undefined} */
    this.maximumDigits = undefined

    /** @type {number | undefined} */
    this.minimumDigits = undefined

    /** @type {number | undefined} */
    this.timeout = undefined
  }

  /**
   * @param {number} digits
   * @returns {InputSettings}
   */
  setMaximumDigits (digits) {
    this.maximumDigits = digits
    return this
  }
  
  /**
   * @param {number} digits
   * @returns {InputSettings}
   */
  setMinimumDigits (digits) {
    this.minimumDigits = digits
    return this
  }

  /**
   * @param {number} timeout
   * @returns {InputSettings}
   */
  setTimeout(timeout) {
    this.timeout = timeout
    return this
  }
}

InputSettings.InputType = InputType

module.exports = InputSettings