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
}

module.exports = Audio