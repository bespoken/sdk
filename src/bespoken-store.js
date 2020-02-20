const axios = require('axios')
const Config = require('./config')
const Job = require('./job').Job
const Store = require('./store')

class BespokenStore extends Store {
  async fetch (run) {
    const url = `${this.accessURL()}/fetch?run=${run}`
    console.log(`BESPOKEN-STORE FETCH run: ${run} url: ${url}`)

    const response = await axios.get(url, {
      responseType: 'text'
    })

    const jobJSON = response.data
    const job = Job.fromJSON(jobJSON)
    return job
  }

  async save (job) {
    console.time('BESPOKEN-STORE SAVE')
    const url = `${this.accessURL()}/save`
    const response = await axios.post(url, job, {
      maxContentLength: (200 * 1024 * 1024), // up to 200 mb - biggest file so far is 57 MB
      responseType: 'json'
    })

    console.timeEnd('BESPOKEN-STORE SAVE')
    job.key = response.data.key
    return response.data.key
  }

  accessURL () {
    return Config.get('storeURL', undefined, false, 'https://batch-tester.bespoken.io')
  }

  logURL (job, index) {
    if (!job.key) {
      return 'N/A'
    }

    if (index === undefined) {
      index = job.results.length - 1
    }

    return `${this.accessURL()}/log?run=${job.key}&index=${index}`
  }
}

module.exports = BespokenStore
