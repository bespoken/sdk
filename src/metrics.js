const Config = require('./config')

class Metrics {
  static instance () {
    return Config.instance('metrics', ['datadog-metrics', 'cloudwatch-metrics', 'metrics'], 'metrics')
  }

  async initialize () {
    return Promise.resolve()
  }

  async publish (job, result) {
    return Promise.resolve()
  }

  get job () {
    return this._job
  }
}

module.exports = Metrics
