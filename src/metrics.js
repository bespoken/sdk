const Config = require('./config')
const moment = require('moment')

class Metrics {
  static instance () {
    return Config.instance('metrics', ['datadog-metrics', 'cloudwatch-metrics', 'metrics'], 'metrics')
  }

  constructor () {
    this._job = Config.get('job')
    this._processTime = moment().format('YYYY-MM-DDTHH-mm-ss')
  }

  async initialize () {
    return Promise.resolve()
  }

  async publish (result) {
    return this._publishJSON(result)
  }

  get job () {
    return this._job
  }

  get run () {
    return this._name + this._processTime
  }
}

module.exports = Metrics
