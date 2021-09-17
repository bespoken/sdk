const Config = require('@bespoken-sdk/shared').Config

/**
 * Interface for storing data
 */
class Store {
  /**
   * @returns {Store}
   */
  static instance () {
    return Config.instance('store', require('./client'))
  }

  /**
   * @returns {Promise<void>}
   */
  async initialize () {
    return Promise.resolve()
  }

  /**
   * If the store provides hosted access, the base URL
   * Defaults to undefined
   * @returns {string} The base URL for accessing stored data
   */
  accessURL () {
    return undefined
  }

  /**
   *
   * @param {any} job
   * @param {number} index
   * @returns {string}
   */
  logURL (job, index) {
    return undefined
  }

  /**
   * Fetches the run by name
   * @param {string} run
   * @returns {any}
   */
  async fetch (run) {
    return Promise.resolve()
  }

  /**
   *
   * @param {any} job
   * @returns {string} key
   */
  async save (job) {
    return Promise.resolve(job.run)
  }

  /**
   * @param {string} run
   * @returns {string}
   */
  static key (run) {
    if (run.endsWith('.json')) {
      return run
    }
    return run + '.json'
  }
}

module.exports = Store
