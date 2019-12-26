const Config = require('./config')

class Metrics {
  static instance () {
    const metricsClass = Config.get('metrics')
    // Special handling for datadog-metrics class, as that is also the name of the package provided by DataDog
    if (metricsClass === 'datadog-metrics') {
      const DataDog = require('./datadog-metrics')
      Config.singleton('metrics', new DataDog())
    }
    return Config.instance('metrics', 'metrics')
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
