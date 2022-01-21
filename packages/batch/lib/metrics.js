const Config = require('@bespoken-sdk/shared/lib/config')
const Job = require('./job')
const logger = require('@bespoken-sdk/shared/lib/logger')('METRICS')
const Result = require('./result')

/**
 * Defines the interface for publishing metrics to data/reporting tools
 */
class Metrics {
  /**
   * @returns {Metrics}
   */
  static instance () {
    const metricsClass = Config.get('metrics')
    // Special handling for datadog-metrics class, as that is also the name of the package provided by DataDog
    if (metricsClass === 'datadog-metrics') {
      const DataDog = require('./datadog-metrics')
      Config.singleton('metrics', new DataDog())
    }
    return Config.instance('metrics', Metrics)
  }

  /**
   * Called to initialize the metrics client
   * @param {Job} job The job the metrics client is publishing data for
   * @returns {Promise<void>}
   */
  async initialize (job) {
    logger.debug('no-op published: ' + job)
    return Promise.resolve()
  }

  /**
   * Called to publish data about a specific result.
   * Must be implemented by sub-classes.
   * @abstract
   * @param {Job} job
   * @param {Result} result
   * @returns {Promise<void>}
   */
  async publish (job, result) {
    logger.debug('no-op published: ' + job + ' result: ' + result)
    return Promise.resolve()
  }
}

module.exports = Metrics
