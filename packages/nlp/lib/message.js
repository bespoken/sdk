const _ = require('lodash')
const Audio = require('./audio')
const Conversation = require('./conversation')
const InputSettings = require('./input-settings')
const logger = require('@bespoken-sdk/shared/lib/logger')('MESSAGE')
const Persistable = require('./persistable')
const Util = require('@bespoken-sdk/shared/lib/util')

/**
 *
 */
class Message extends Persistable {
  /**
   * @param {Conversation} conversation
   * @param {InputSettings} inputSettings
   * @returns {Message} 
   */
  static fromAudioStream(conversation, inputSettings) {
    const message = new Message(conversation, inputSettings)
    message._audio = new Audio()
    return message
  }

  /**
   * @param {Conversation} conversation
   * @param {string} audio
   * @returns {Message} 
   */
  static fromAudioBase64(conversation, audio) {
    const message = new Message(conversation, new InputSettings('VOICE'))
    const audioBuffer = Buffer.from(audio, 'base64')
    message._audio = new Audio(audioBuffer)
    return message
  }

  /**
   * @param {Conversation} conversation
   * @param {Buffer} audio
   * @returns {Message} 
   */
  static fromAudioBuffer(conversation, audio) {
    const message = new Message(conversation, new InputSettings('VOICE'))
    message._audio = new Audio(audio)
    return message
  }

  /**
   * 
   * @param {Conversation} conversation
   * @param {Buffer} buffer
   * @returns {Message} 
   */
  static fromBufferAsStream(conversation, buffer) {
    const message = new Message(conversation, new InputSettings('VOICE'))
    message._audio = new Audio()
    const chunkSize = 3000
    new Promise(async (resolve) => {
      while (buffer.length > 0) {
        let bytesToRead = chunkSize
        if (buffer.length < chunkSize) {
          bytesToRead = buffer.length
        }
        const newBuffer = buffer.slice(0, bytesToRead)
        buffer = buffer.slice(bytesToRead)
        message.audio?.push(newBuffer)
        await Util.sleep(100)
        //console.info('pushed data')
      }
      resolve(undefined)
    }).then(() => {
      logger.info('creating stream from buffer - done writing buffer to stream')
    })
    return message
  }

  /**
   * @param {any} o
   * @returns {Message}
   */
  static fromJSON(o) {
    const conversation = Conversation.fromJSON(o.conversation)
    const message = new Message(conversation, InputSettings.fromJSON(o.inputSettings))
    if (o.audio) {
      message._audio = Audio.fromJSON(o.audio)
    }

    if (o.originalMessage) {
      message.originalMessage = Message.fromJSON(o.originalMessage)
    }
    message.id = o.id
    message.createdTimestamp = o.createdTimestamp
    message._text = o.text
    message._locale = o.locale
    return message
  }
  
  /**
   * 
   * @param {Conversation} conversation
   * @param {string} text
   * @param {Message} [originalMessage]
   * @returns {Message} 
   */
  static fromText(conversation, text, originalMessage) {
    let inputSettings
    if (originalMessage?.inputSettings) {
      // Make a copy of the input settings if we are pulling it off the original message
      inputSettings = InputSettings.fromJSON(originalMessage?.inputSettings)
    } else {
      inputSettings = new InputSettings('TEXT')
    }
    const message = new Message(conversation, inputSettings)
    message.originalMessage = originalMessage
    message._text = text
    return message
  }

  /**
   * 
   * @param {Conversation} conversation
   * @param {number} dtmfInput
   * @param {InputSettings} inputSettings
   * @returns {Message} 
   */
   static fromDTMF(conversation, dtmfInput, inputSettings) {
    const message = new Message(conversation, inputSettings)
    message._text = dtmfInput + ''
    return message
  }

  /**
   * 
   * @param {Conversation} conversation
   * @returns {Message} 
   */
  static emptyMessage(conversation) {
    const message = new Message(conversation, new InputSettings('VOICE'))
    return message
  }

  /**
   * @param {Conversation} conversation
   * @param {InputSettings} inputSettings
   */
  constructor(conversation, inputSettings) {
    super()
    this._conversation = conversation
    
    /** @private @type {Audio | undefined} */
    this._audio = undefined

    /** @private */
    this._locale = 'en-US'
    
    /** @private @type {string | undefined} */
    this._text = undefined

    /** @type {InputSettings} */
    this._inputSettings = inputSettings

    /** @type {Message | undefined} */
    this.originalMessage = undefined
  }

  /**
   * @returns {Audio | undefined}
   */
  get audio() {
    return this._audio
  }

  /**
   * @returns {Conversation}
   */
  get conversation() {
    return this._conversation
  }

  /**
   * @returns {InputSettings}
   */
  get inputSettings() {
    return this._inputSettings
  }

  /**
   * @returns {string}
   */
  get locale() {
    return this._locale;
  }
  
  /**
   * @returns {string | undefined}
   */
  get text() {
    return this._text
  }

  /**
   * @returns {Audio}
   */
  audioRequired() {
    if (!this._audio) {
      throw new Error("This should not happen - audio is not defined")
    }
    return this._audio
  }

  /**
   * Clones the message object
   * @returns {Message}
   */
  clone() {
    const message = new Message(this.conversation, this.inputSettings)
    Object.assign(message, this)
    message.originalMessage = this
    return message
  }

  /**
   * @returns {boolean}
   */
  isEmpty() {
    return this.text === undefined && this.audio === undefined
  }

  /**
   * @returns {any}
   */
  toJSON() {
    /** @type {any} */
    const clone = _.defaultsDeep({}, this)
    clone.audio = clone._audio
    clone.conversation = clone._conversation
    clone.inputSettings = clone._inputSettings
    clone.locale = clone._locale
    clone.text = clone._text 

    delete clone._audio
    delete clone._conversation
    delete clone._inputSettings
    delete clone._locale
    delete clone._text
    return clone
  }

  /**
   * @param {number} [indent]
   * @returns {string}
   */
  toStringAsJSON(indent=2) {
    const o = this.toJSON()
    return JSON.stringify(o, (p, value) => {
      if (p === 'audio') {
        return `[length: ${value}]`
      } else {
        return value
      }
    }, indent)
  }

  /**
   * @returns {string}
   */
  toString() {
    if (this.text) {
      return 'message: ' + this.text
    } else if (this.audio) {
      return 'message: [audio ' + this.audio.toString() + ' timeout ' + this.inputSettings.timeout + ']'
    } else {
      return 'message: text and audio undefined'
    }
  }
}

module.exports = Message