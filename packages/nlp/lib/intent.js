/**
 * Holds intent data
 */
 class Intent {
  /**
   * 
   * @param {string} name 
   * @param {number | undefined} [confidence]
   */
  constructor(name, confidence) {
    this.name = name
    this.confidence = confidence
  }
}

module.exports = Intent