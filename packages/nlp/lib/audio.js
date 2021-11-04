const logger = require('@bespoken-sdk/shared/lib/logger')('AUDIO')
const Readable = require('stream').Readable

/**
 * Class to handle audio payload
 */
class Audio {
  /**
   * 
   * @param {Buffer} [buffer]
   * @param {string} [type='pcm'] 
   */
  constructor(buffer, type = 'pcm') {
    this.buffer = buffer 
    this.type = type  
    this.sampleRate = 16000
    this.bitsPerSample = 16
    this.channels = 1

    this._stream = this.buffer ? undefined : new AudioStream()
  }

  /**
   * @returns {string}
   */
  base64() {
    return this.buffer.toString('base64')
  }

  /**
   * @returns {void}
   */
  close() {
    logger.debug('close stream')
    if (this._stream) {
      this._stream.destroy()
      //this._stream.destroy()
    } 
  }

  /**
   * @returns {number}
   */
  durationInSeconds() {
    if (this.type !== 'pcm') {
      throw new Error("Cannot compute duration for anything other than PCM")
    }

    const length = this.length()
    if (length === undefined) {
      throw new Error("Cannot compute duration for audio without a buffer length")
    }

    const duration = this.buffer.buffer.byteLength / this.sampleRate
    // console.info('duraiton: ' + duration)
    return duration
  }

  /**
   * @returns {boolean}
   */
  isStream() {
    return this.buffer === undefined
  }

  /**
   * @returns {number | undefined}
   */
  length() {
    return this.buffer.length
  }

  /**
   * @param {Buffer} buffer
   * @returns {void}
   */
  push(buffer) {
    logger.trace('add to buffer: ' + buffer.length)
    this.stream().addToBuffer(buffer)
  }

  /**
   * @param {(8 | 16 | 32)} bitsPerSample 
   * @returns {Audio}
   */
  setBitsPerSample(bitsPerSample) {
    this.bitsPerSample = bitsPerSample
    return this
  }

  /**
   * @param {(1 | 2)} channels 
   * @returns {Audio}
   */
  setChannels(channels) {
    this.channels = channels
    return this
  }

  /**
   * @param {(8000 | 16000)} sampleRate 
   * @returns {Audio}
   */
  setSampleRate(sampleRate) {
    this.sampleRate = sampleRate
    return this
  }

  /**
   * @returns {AudioStream}
   */
  stream() {
    return this._stream
  }

  /**
   * @returns {string}
   */
  toString() {
    if (this.isStream()) {
      return 'length: streaming'
    } else {
      return 'length: ' + this.length()
    }
  }
}

/**
 *
 */
class AudioStream extends Readable {
  constructor() {
    super()
    this.position = 0
    this.buffer = Buffer.alloc(0)   
    
    /** @private */
    this._destroyed = false
  }

  /**
   * @param {Buffer} buffer
   * @returns {void}
   */
  addToBuffer(buffer) {
    if (this.destroyed) {
      logger.error('Not pushing data because destroyed' + this.buffer.length)
      return
    }
    this.buffer = Buffer.concat([this.buffer, buffer])
    //this.push(buffer)
  }

  /**
   * 
   * @param {Error} error 
   * @param {Function} callback 
   * @returns {void}
   */
  _destroy(error, callback) {
    logger.debug('destroy stream')
    this._destroyed = true
    if (error) {
      callback(error)
    } else {
      callback()
    }
  }
  /**
   * @param {number} size
   * @returns {void}
   */
  _read (size) {
    logger.trace('stream read size: ' + size + ' length: ' + this.buffer.length + ' position: ' + this.position)

    let endIndex = this.position + size
    if (endIndex > this.buffer.length) {
      endIndex = this.buffer.length
    }
    
    const data = this.buffer.slice(this.position, endIndex)
    this.position = endIndex
    if (data.length > 0) {
      this.push(data)
    }
  }
}


/**
 * @callback AudioReceivedListener
 * @param {Buffer} buffer
 */
module.exports = Audio