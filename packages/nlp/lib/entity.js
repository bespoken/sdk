/**
 * Holds entity object
 */
class Entity {
  /**
   * @param {string} name 
   * @param {string} value 
   * @param {string} transcription 
   * @param {number} confidence 
   */
  constructor(name, value, transcription, confidence) {
    this.name = name
    this.value = value
    this.transcription = transcription
    this.confidence = confidence
  }
}

module.exports = Entity