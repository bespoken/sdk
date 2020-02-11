const Config = require('./config')

class Store {
  /**
   * @return {Store}
   */
  static instance () {
    return Config.instance('store', './bespoken-store')
  }

  async initialize () {
    return Promise.resolve()
  }

  /**
   * Fetches the run by name
   * @param {string} run
   * @returns {Job}
   */
  async fetch (run) {
    return Promise.resolve()
  }

  /**
   *
   * @param {Object} job
   * @returns {string} key
   */
  async save (job) {
    return Promise.resolve(job.run)
  }

  get job () {
    return this._job
  }

  get run () {
    return this._name + this._processTime
  }

  static key (run) {
    return run + '.json'
  }
}

module.exports = Store
