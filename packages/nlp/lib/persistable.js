module.exports = class {
  constructor() {
    /** @type {String} */
    this.id = this.generatedID()

    /** @type {Date} */
    this.createdTimestamp = new Date()
  }

  /**
   * @protected
   * @returns {string}
   */
  generatedID() {
    return require('uuid').v4()
  }
}