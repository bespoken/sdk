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
   * @type {string}
   */
  get key() {
    throw new Error('Property must be implemented')
  }
}

module.exports = DTO