const Config = require('./config')

class Source {
  static instance () {
    return Config.instance('source', undefined, 'csv-source')
  }

  async load () {
    throw new Error('No-op - must be implemented by subclass')
  }
}

module.exports = Source
