/**
 * Data transfer object class
 */
class DTO {
  /**
   * @param {any} json
   */
  constructor(json) {
    this.json = json
  }
  
  /**
   * @returns {boolean}
   */
  get finalized() {
    return true
  }
  
  /**
   * @type {string}
   */
  get key() {
    throw new Error('Property must be implemented')
  }

  /**
   * @returns {any}
   */
  asJSON() {
    return this.json
  }
}

module.exports = DTO