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
   * @returns {Message} 
   */
  static fromAudioStream(conversation) {
    const message = new Message(conversation, new InputSettings('VOICE'))
    message.audio = new Audio()
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
    message.audio = new Audio(audioBuffer)
    return message
  }

  /**
   * @param {Conversation} conversation
   * @param {Buffer} audio
   * @returns {Message} 
   */
  static fromAudioBuffer(conversation, audio) {
    const message = new Message(conversation, new InputSettings('VOICE'))
    message.audio = new Audio(audio)
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
    message.audio = new Audio()
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
    _.defaults(message, o)
    return message
  }
  /**
   * 
   * @param {Conversation} conversation
   * @param {string} text
   * @returns {Message} 
   */
  static fromText(conversation, text) {
    const message = new Message(conversation, new InputSettings('TEXT'))
    message.text = text
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
    this.conversation = conversation
    /**
     * @type {Audio | undefined}
     */
    this.audio = undefined

    this.locale = 'en-US'
    
    /** @type {string | undefined} */
    this.text = undefined

    /** @type {InputSettings} */
    this.inputSettings = inputSettings

    /** @type {Message | undefined} */
    this.originalMessage = undefined
  }

  /**
   * @returns {Audio}
   */
  audioRequired() {
    if (!this.audio) {
      throw new Error("This should not happen - audio is not defined")
    }
    return this.audio
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