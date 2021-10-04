/**
 * Holds intent data
 */
 class Intent {
  /**
   * 
   * @param {string} name 
   * @param {number} confidence 
   */
  constructor(name, confidence) {
    this.name = name
    this.confidence = confidence
  }
}

module.exports = Intent