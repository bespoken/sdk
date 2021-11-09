
const _ = require('lodash')
const DTO = require('@bespoken-sdk/shared/lib/dto')

/**
 *
 */
class ProviderConfiguration extends DTO {
  /**
   * @param {any} json
   */
  constructor (json) {
    super(json)
    // If the json is just a string, means configuration is just the class name
    if (_.isString(json)) {
      this.json = {
        class: json
      }
    }
  }

  /**
   * @returns {string}
   */
  get class () {
    return this.json.class
  }

  /**
   * @returns {string[] | undefined}
   */
  get recognitionHints () {
    return this.json.recognitionHints
  }

  /**
   *
   */
  set recognitionHints (array) {
    this.json.recognitionHints = array
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
   * @param {string} [defaultValue]
   * @returns {string}
   */
  requiredString (key, defaultValue) {
    console.info('json: ' + JSON.stringify(this.json, null, 2))
    const value = this.json[key] ? this.json[key] : defaultValue
    if (!value) {
      throw new Error('No value found for configuration setting: ' + key + ' for provider: ' + this.class)
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

module.exports = ProviderConfiguration
