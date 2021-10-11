/**
 * Class to handle audio payload
 */
class Audio {
  /**
   * 
   * @param {Buffer} buffer 
   * @param {string} [type='pcm'] 
   */
  constructor(buffer, type = 'pcm') {
    this.buffer = buffer 
    this.type = type  
    this.sampleRate = 16000
    this.bitsPerSample = 16
    this.channels = 1
  }

  /**
   * @returns {string}
   */
  base64() {
    return this.buffer.toString('base64')
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
    if (this.buffer) {
      this.buffer = Buffer.concat([this.buffer, buffer])
    } else {
      buffer = buffer
    }

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
}


/**
 * @callback AudioReceivedListener
 * @param {Buffer} buffer
 */
module.exports = Audio