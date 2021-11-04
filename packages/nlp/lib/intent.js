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

    // To keep track of multi-step intents
    this.finalized = false
  }
}

module.exports = Intent