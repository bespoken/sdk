const _ = require('lodash')
const axios = require('axios')
const Config = require('./config')
const Job = require('./job').Job
const { Readable } = require('stream')
const Store = require('./store')
const zlib = require('zlib')

class BespokenStore extends Store {
  async fetch (run) {
    console.time('BESPOKEN-STORE FETCH')
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
      console.info(`BESPOKEN-STORE FETCH downloaded: ${(buffer.length / 1024 / 1024)}M`)
    })

    return new Promise((resolve) => {
      streamResponse.data.on('end', () => {
        console.timeEnd('BESPOKEN-STORE FETCH')
        const jobJSON = JSON.parse(buffer.toString('utf-8'))
        const job = Job.fromJSON(jobJSON)
        resolve(job)
      })
    })
  }

  async filter (runName, limit = 10) {
    console.time('BESPOKEN-STORE FILTER')
    const url = `${this.accessURL()}/filter?run=${runName}&limit=${limit}`

    const response = await axios.get(url)
    const jobs = response.data.jobs
    console.timeEnd('BESPOKEN-STORE FILTER')
    return jobs
  }

  async save (job) {
    console.time('BESPOKEN-STORE SAVE')
    const url = `${this.accessURL()}/save?run=${job.run}`

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
    return process.env.STORE_URL ? process.env.STORE_URL : 'https://batch-tester.bespoken.io'
  }

  async decrypt (key) {
    const url = `${this.accessURL()}/decrypt?key=${key}`
    const response = await axios.get(url)
    return response.data.decryptedKey
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
  const bespokenStore = new BespokenStore()
  // bespokenStore.fetch('b0dd06d0de84bf4127b911716fa58868c8b802927829a560094ba83e1b603f50').then(async (job) => {
  bespokenStore.fetch('e3ddeac12879bd475a7648c5370e06dae18af24ec5ecdad0e6ba33221e967466').then(async (job) => {
    job._run = job._run + 'V2'
    const Printer = require('./printer')
    const printer = new Printer()

    console.time('Print')
    await printer.print(job)
    console.timeEnd('Print')

    await bespokenStore.save(job)
  })
}
