const logger = require('@bespoken-sdk/shared/lib/logger')('AUDIO')
const MemoryStream = require('memorystream');
const Readable = require('stream').Readable

/**
 * Class to handle audio payload
 */
class Audio {
  /**
   * @param {any} o
   * @returns {Audio}
   */
  static fromJSON(o) {
    const audio = new Audio(o.buffer, o.type)
    return audio
  }
  
  /**
   * 
   * @param {Buffer} [buffer]
   * @param {string} [type='pcm'] 
   */
  constructor(buffer, type = 'pcm') {
    /** @private */
    this._buffer = buffer 
    this.type = type  
    this.sampleRate = 16000
    this.bitsPerSample = 16
    this.channels = 1

    // if (!this.buffer) {
    //   this.tempFile = `/tmp/${uuid.v4()}.raw`
    //   logger.info('tempfile: ' + this.tempFile)
    //   this.writeStream = fs.createWriteStream(this.tempFile)
    //   this.readStream = fs.createReadStream(this.tempFile)
    //   this.readStream.pipe(this.writeStream)
    // }

    if (!this._buffer) {
      // We store stream data here for debugging purposes
      this._streamBuffer = Buffer.alloc(0)
      this._stream = new MemoryStream(Buffer.alloc(0), {
        bufoverflow: 10000000,
        frequence: 1000,
        maxbufsize: 20000000,
        readable: true,
        writeable: true
      })
      
      this._stream.on('data', (data) => {
        this._streamBuffer = Buffer.concat([this._streamBuffer, data])
        //logger.info('data received: ' + data.length)
        logger.debugFile('debug/out.pcm', data)
      })
    }
    //this._stream = this.buffer ? undefined : new AudioStream()
  }

  /**
   * @returns {string | undefined}
   */
  base64() {
    return this.buffer().toString('base64')
  }

  /**
   * @returns {Buffer}
   */
  buffer() {
    if (this._streamBuffer) {
      return this._streamBuffer
    } else if (this._buffer) {
      return this._buffer
    } else {
      throw new Error('This should never happen')
    }
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

    const duration = this.buffer().buffer.byteLength / this.sampleRate
    // console.info('duraiton: ' + duration)
    return duration
  }

  /**
   * @returns {boolean}
   */
  isStream() {
    return this._buffer === undefined
  }

  /**
   * @returns {number | undefined}
   */
  length() {
    const stream = this.stream()
    if (stream) {
      return this._streamBuffer ? this._streamBuffer.length : -1
    }
    return this._buffer?.length
  }

  /**
   * @param {Buffer} buffer
   * @returns {void}
   */
  push(buffer) {
    if (!this._stream || this._stream.destroyed) {
      return
    }
    
    const result = this._stream?.write(buffer, 'binary', (error) => {
      if (error) {
        logger.error('push write failed: ' + error)
      }
    })

    if (!result) {
      console.info('push buffer failed: ' + result)
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
   * @returns {Readable | undefined}
   */
  stream() {
    return this._stream
  }

  /**
   * @returns {Readable}
   */
  streamRequired() {
    if (!this._stream) {
      throw new Error('No stream defined for audio')
    }  
    return this._stream
  }

  /**
   * @returns {string}
   */
  toJSON () {
    return this.toString()
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

module.exports = Audio