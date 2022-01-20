/**
 *
 */
class JSONWrapper {
  constructor(json) {
    this.json = json
  }

  /**
   * @param {string} key
   * @returns {number | undefined}
   */
  number (key) {
    const value = this.json[key]
    if (value) {
      return parseFloat(value)
    }
    return undefined
  }

  /**
   * @param {string} key
   * @param {number} [defaultValue]
   * @returns {number}
   */
  requiredNumber (key, defaultValue) {
    const value = this.json[key] ? this.json[key] : defaultValue
    if (!value) {
      throw new Error('No value found for property: ' + key)
    }
    return value
  }

  /**
   * @param {string} key
   * @param {string} [defaultValue]
   * @returns {string}
   */
  requiredString (key, defaultValue) {
    const value = this.json[key] ? this.json[key] : defaultValue
    if (!value) {
      throw new Error('No value found for property: ' + key)
    }
    return value
  }

  /**
   * @param {string} key
   * @returns {string | undefined}
   */
  string (key) {
    return this.json[key]
  }
}

module.exports = JSONWrapper