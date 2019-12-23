const moment = require('moment')

module.exports = class Job {
  constructor (name, run, config) {
    this._name = name
    if (run) {
      this._run = run
    } else {
      this._run = name + '_' + moment().format('YYYY-MM-DDTHH-mm-ss')
    }
    this._config = config

    // Initializes other fields
    this._expectedFields = []
    this._results = []
  }

  addResult (result) {
    this.results.push(result)
  }

  get config () {
    return this._config
  }

  get expectedFields () {
    return this._expectedFields
  }

  get name () {
    return this._name
  }

  get results () {
    return this._results
  }

  get run () {
    return this._run
  }
}
