
const _ = require('lodash')
const JSONWrapper = require('@bespoken-sdk/shared/lib/json-wrapper')

/**
 *
 */
class ProviderConfiguration extends JSONWrapper {
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
}

module.exports = ProviderConfiguration
