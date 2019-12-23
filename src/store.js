const Config = require('./config')

class Store {
  static instance () {
    return Config.instance('store', ['s3-store'], 's3-store')
  }

  async initialize () {
    return Promise.resolve()
  }

  async fetch (job) {
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
