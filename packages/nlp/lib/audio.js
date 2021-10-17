const Readable = require('stream').Readable

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

  /**
   * @returns {Readable}
   */
  stream() {
    let position = 0
    const self = this
    
    this.readable = new Readable({
      
      read: function(size) {
        console.info('audio read size: ' + size + ' length: ' + self.buffer.length + ' position: ' + position)
    
        let endIndex = position + size
        if (endIndex > self.buffer.length) {
          endIndex = self.buffer.length
        }
        //console.trace()
        const data = self.buffer.slice(position, endIndex)
        position = endIndex
        console.info('Pushing data: ' + data.length)
        if (data.length > 0) {
          this.push(data)
        } else {
          this.destroy()
        }
      }
    })
    return this.readable
  }
}


/**
 * @callback AudioReceivedListener
 * @param {Buffer} buffer
 */
module.exports = Audio