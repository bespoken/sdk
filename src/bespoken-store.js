const axios = require('axios')
const Config = require('./config')
const Job = require('./job')
const Store = require('./store')

class BespokenStore extends Store {
  async fetch (run) {
    console.log(`BESPOKEN-STORE FETCH run: ${run}`)
    const url = `${this.accessURL()}/fetch?run=${run}`
    const response = await axios.get(url, {
      responseType: 'json'
    })
    const jobJSON = JSON.parse(response.data)
    const job = Job.fromJSON(jobJSON)
    return job
  }

  async save (job) {
    console.time('BESPOKEN-STORE SAVE')
    const url = `${this.accessURL()}/save`
    const response = await axios.post(url, job, {
      responseType: 'json'
    })

    console.timeEnd('BESPOKEN-STORE SAVE')
    return response.data.key
  }

  accessURL () {
    return Config.get('storeURL', undefined, false, 'https://batch-tester.bespoken.io')
  }
}

module.exports = BespokenStore
