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
    if (!buffer) {
      this.streamBuffer = Buffer.alloc(0)  
    }
    this.type = type  
    this.sampleRate = 16000
    this.bitsPerSample = 16
    this.channels = 1

    this.readable = undefined
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
    console.info('close stream')
    if (this.readable) {
      this.readable.destroy()
    } 
  }

  /**
   * @returns {boolean}
   */
  isStream() {
    return this._stream !== undefined
  }

  /**
   * @returns {number | undefined}
   */
  length() {
    return this.buffer.length
  }

  /**
   * @param {AudioReceivedListener} listener 
   * @returns {Audio}
   */
  onAudioReceived(listener) {
    this.listener = listener
    return this
  }

  /**
   * @param {Buffer} buffer
   * @returns {void}
   */
  push(buffer) {
    if (!this.streamBuffer) {
      throw new Error('Pushing data to stream buffer but not audio not set in stream mode')
    }

    if (this.isStream()) {
      this.stream().addToBuffer(buffer)
    }

    //this.streamBuffer = Buffer.concat([this.streamBuffer, buffer])
  
    if (this.listener) {
      this.listener(buffer)
    }
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
    if (!this._stream) {
      this._stream = new AudioStream()
    }
    return this._stream
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
      console.info('Not puhshing data because destroyed' + this.buffer.length)
      return
    }
    this.buffer = Buffer.concat([this.buffer, buffer])
    this.push(buffer)
  }

  /**
   * 
   * @param {Error} error 
   * @param {Function} callback 
   * @returns {void}
   */
  _destroy(error, callback) {
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
    // logger.debug('stream read size: ' + size + ' length: ' + this.buffer.length + ' position: ' + this.position)

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