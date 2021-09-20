const Config = require('@bespoken-sdk/shared').Config
const DTO = require('./dto')

/**
 * Interface for storing data
 */
class Store {
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
   * @param {DTO} dto
   * @param {number} index
   * @returns {string}
   */
  logURL (dto, index) {
    throw new Error('Not implemented for: ' + dto + ' index: ' + index)
  }

  /**
   * Fetches the object by key
   * @abstract
   * @param {string} key
   * @returns {Promise<DTO>}
   */
  async fetch (key) {
    throw new Error('Not implemented for: ' + key)
  }

  /**
   *
   * @param {DTO} dto
   * @returns {Promise<string>} key
   */
  async save (dto) {
    return Promise.resolve(dto.key)
  }
}

module.exports = Store
