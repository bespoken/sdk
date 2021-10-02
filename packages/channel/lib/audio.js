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
  }

  /**
   * @returns {string}
   */
  base64() {
    return this.buffer.toString('base64')
  }
}

module.exports = Audio