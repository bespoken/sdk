const Config = require('./config')

class Interceptor {
  static instance () {
    return Config.instance('interceptor', undefined, 'interceptor', false)
  }

  interceptRecord (record) {

  }

  interceptResult (record, result) {

  }
}

module.exports = Interceptor
