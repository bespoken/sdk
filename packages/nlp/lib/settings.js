const NLPConfiguration = require('./nlp-configuration')
const ProviderConfiguration = require('./provider-configuration')

/**
 *
 */
class Settings extends ProviderConfiguration {
  /**
   * @returns {NLPConfiguration}
   */
  get nlp () {
    return new NLPConfiguration(this.json.nlp)
  }

  /**
   * @returns {string}
   */
  get initialContext () {
    return this.json.initialContext
  }

  /**
   *
   * @param {string} contextName
   * @returns {NLPConfiguration | undefined}
   */
  context (contextName) {
    const config = this.json.context?.[contextName]
    if (config) {
      return new NLPConfiguration(config)
    } else {
      return undefined
    }
  }

  /**
   * @returns {any}
   */
   toJSON() {
    return this.json
  }
}

module.exports = Settings
