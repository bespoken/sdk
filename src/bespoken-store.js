const _ = require('lodash')
const axios = require('axios')
const Config = require('./config')
const Job = require('./job').Job
const { Readable } = require('stream')
const Store = require('./store')
const zlib = require('zlib')

class BespokenStore extends Store {
  async fetch (run) {
    const url = `${this.accessURL()}/fetch?run=${run}`
    console.info(`BESPOKEN-STORE FETCH run: ${run} url: ${url}`)

    const streamResponse = await axios.get(url, {
      headers: {
        'accept-encoding': 'gzip'
      },
      maxBodyLength: 1024 * 1024 * 1024, // Load up to 1 GB file
      maxContentLength: 1024 * 1024 * 1024, // Load up to 1 GB file
      responseType: 'stream'
    })

    let buffer = Buffer.alloc(0)
    streamResponse.data.on('data', (b) => {
      buffer = Buffer.concat([buffer, b])
    })

    return new Promise((resolve) => {
      streamResponse.data.on('end', () => {
        const jobJSON = JSON.parse(buffer.toString('utf-8'))
        const job = Job.fromJSON(jobJSON)
        resolve(job)
      })
    })
  }

  async save (job) {
    console.time('BESPOKEN-STORE SAVE')
    const url = `${this.accessURL()}/save`

    // Create a stream from the JSON
    const jsonStream = Readable.from(JSON.stringify(job))
    const gzipStream = jsonStream.pipe(zlib.createGzip())
    const response = await axios.post(url, gzipStream, {
      headers: {
        'Content-Encoding': 'gzip'
      },
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

if (_.nth(process.argv, 2) === 'test-store') {
  const FileStore = require('./file-store')
  const store = new FileStore()
  const bespokenStore = new BespokenStore()
  store.fetch('4ffb47e3bec6ce3ddb4ebf2f2707e06aa121b01a6930ebc1e8f752f5201cffb9').then(async (job) => {
    job._run = job._run + 'V2'
    const Printer = require('./printer')
    const printer = new Printer()

    console.time('Print')
    await printer.print(job)
    console.timeEnd('Print')

    await bespokenStore.save(job)
  })
}
