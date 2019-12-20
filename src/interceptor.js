const Config = require('./config')

class Interceptor {
  static instance () {
    return Config.instance('interceptor', undefined, 'interceptor', false)
  }

  async interceptRecord (record) {
    return true
  }

  async interceptResult (record, result) {
    return true
  }
}

module.exports = Interceptor
