const Config = require('./config')

class Store {
  static instance () {
    let className = Config.get('store', [], false, './s3-store')
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
