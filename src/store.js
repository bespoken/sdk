const Config = require('./config')

class Store {
  /**
   * @return {Store}
   */
  static instance () {
    const className = Config.get('store', undefined, false)
    // This code is done to fix module-loading issue in Node 12
    if (className === 's3-store') {
      Config.set('store', './s3-store')
    } else if (className === 'file-store') {
      Config.set('store', './file-store')
    }
    return Config.instance('store', './s3-store')
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

  async save (job) {
    return Promise.resolve()
  }

  get job () {
    return this._job
  }

  get run () {
    return this._name + this._processTime
  }
}

module.exports = Store
