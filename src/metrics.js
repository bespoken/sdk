const Config = require('./config')

/**
 * Defines the interface for publishing metrics to data/reporting tools
 */
class Metrics {
  static instance () {
    const metricsClass = Config.get('metrics')
    // Special handling for datadog-metrics class, as that is also the name of the package provided by DataDog
    if (metricsClass === 'datadog-metrics') {
      const DataDog = require('./datadog-metrics')
      Config.singleton('metrics', new DataDog())
    }
    return Config.instance('metrics', 'metrics')
  }

  /**
   * Called to initialize the metrics client
   */
  async initialize () {
    return Promise.resolve()
  }

  /**
   * Called to publish data about a specific result.
   * Must be implemented by sub-classes.
   * @param {Job} job
   * @param {Result} result
   * @returns {Promise<void>}
   */
  async publish (job, result) {
    return Promise.resolve()
  }
}

module.exports = Metrics
