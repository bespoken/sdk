const Config = require('./config')

class Store {
  /**
   * @return {Store}
   */
  static instance () {
    let className = Config.get('store', undefined, false, './s3-store')
    if (className === 's3-store') {
      className = './s3-store'
    } else if (className === 'file-store') {
      className = './file-store'
    }
    return Config.instance('store', className)
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
