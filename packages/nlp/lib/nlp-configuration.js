const ProviderConfiguration = require('./provider-configuration')

/**
 *
 */
class NLPConfiguration extends ProviderConfiguration {
  /**
   * @returns {ProviderConfiguration | undefined}
   */
  get action () {
    if (!this.json.action) {
      return undefined
    }
    return new ProviderConfiguration(this.json.action)
  }

  /**
   * @returns {ProviderConfiguration}
   */
  get nlu () {
    return new ProviderConfiguration(this.json.nlu)
  }

  /**
   * @returns {ProviderConfiguration}
   */
  get recognizer () {
    return new ProviderConfiguration(this.json.recognizer)
  }

  /**
   * @returns {ProviderConfiguration | undefined}
   */
  get tts () {
    if (this.json.tts) {
      return new ProviderConfiguration(this.json.tts)
    }
    return undefined
  }
}

module.exports = NLPConfiguration
