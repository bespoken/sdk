/**
 * @enum {string}
 */
const InputType = {
  DTMF: 'DTMF',
  TEXT: 'TEXT',
  VOICE: 'VOICE'
} 

/**
 * @enum {string}
 */
const DialogState = {
  CONFIRM_INTENT: 'CONFIRM_INTENT',
  CONFIRM_SLOT: 'CONFIRM_SLOT',
  ELICIT_INTENT: 'ELICIT_INTENT',
  ELICIT_SLOT: 'ELICIT_SLOT'
}
/**
 *
 */
class InputSettings {
  /**
   * @param {any} o 
   * @returns {InputSettings}
   */
  static fromJSON(o) {
    const settings = new InputSettings(o.type)
    Object.assign(settings, o)
    return settings
  }

  /**
   * @param {InputType} type
   */
  constructor(type) {
    this.type = type

    /** @type {DialogState} */
    this.dialogState = DialogState.ELICIT_INTENT

    /** @type {string | undefined} */
    this.intentToConfirm = undefined
    
    /** @type {number | undefined} */
    this.maximumDigits = undefined

    /** @type {number | undefined} */
    this.minimumDigits = undefined

    /** @type {string | undefined} */
    this.slotToConfirm = undefined
    
    /** @type {string | undefined} */
    this.slotToElicit = undefined
    
    /** @type {number | undefined} */
    this.timeout = undefined
  }

  /**
   * @param {DialogState} state 
   * @returns {InputSettings}
   */
  setDialogState(state) {
    this.dialogState = state
    return this
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

InputSettings.DialogState = DialogState
InputSettings.InputType = InputType

module.exports = InputSettings