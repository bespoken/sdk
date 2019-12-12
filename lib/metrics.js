const Config = require('./config')
const moment = require('moment')

class Metrics {
  static instance (name) {
    const metrics = Config.get('metrics', ['datadog', 'cloudwatch', 'none'])
    if (!metrics) {
      // Do a no-op if METRICS is not specified
      console.log('No METRICS provider specified - not publishing metrics')
      return new Metrics()
    }

    let MetricsClass
    if (metrics.toLowerCase() === 'datadog') {
      MetricsClass = require('./datadog-metrics')
    } else {
      MetricsClass = require('./cloudwatch-metrics')
    }
    return new MetricsClass(name)
  }

  constructor (name) {
    this._name = name
    this._processTime = moment().format('YYYY-MM-DDTHH-mm-ss')
  }

  async initialize () {
    return Promise.resolve()
  }

  async publish (result) {
    return this._publishJSON(result)
  }

  get job () {
    return this._name
  }

  get run () {
    return this._name + this._processTime
  }
}

module.exports = Metrics
