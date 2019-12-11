const CloudWatchMetrics = require('./cloudwatch-metrics')
const DataDogMetrics = require('./datadog-metrics')

require('dotenv').config()

class Metrics {
  static instance () {
    const metrics = process.env.METRICS
    if (!metrics) {
      // Do a no-op if METRICS is not specified
      console.log('No METRICS provider specified - not publishing metrics')
      return new Metrics()
    }

    if (metrics.toLowerCase() === 'datadog') {
      return new DataDogMetrics()
    } else {
      return new CloudWatchMetrics()
    }
  }

  constructor (name) {

  }

  async initialize () {

  }

  async publish (result) {
    return this._publishJSON(result)
  }
}

module.exports = Metrics
