const _ = require('lodash')
const AWS = require('aws-sdk')
const fs = require('fs')
const http = require('http')
const Job = require('../src/job').Job
const { Readable } = require('stream')
const Store = require('../src/store')
const S3Store = require('../src/s3-store')
const URL = require('url')
const Util = require('../src/util')
const zlib = require('zlib')

class Server {
  constructor (listener) {
    this.listener = listener
    this.store = new S3Store()
  }

  async start (port = 3000) {
    return new Promise((resolve) => {
      this.server = http.createServer((message, response) => {
        const dataStream = zlib.createGunzip()

        // If we are sending data, means we are saving a job
        // We create a pipe to send it to S3
        this.buffer = message.on('data', (chunk) => {
          dataStream.write(chunk)
        })

        // Close the pipe if done writing
        message.on('end', () => {
          if (message.method === 'POST') {
            dataStream.end()
          }
        })

        this._handleRequest(message, response, dataStream)
      })

      this.server.listen(port, () => {
        resolve()
      })
    })
  }

  stop () {
    return new Promise((resolve) => {
      console.log('SERVER STOP CALLED')

      this.server.close(() => {
        console.log('SERVER STOPPED')
        resolve()
      })
    })
  }

  _handleRequest (message, response, dataStream) {
    const url = URL.parse(message.url, true) /* eslint-disable-line */
    const path = url.pathname

    if (path === '/decrypt') {
      this._decrypt(response, url)
    } else if (path === '/fetch') {
      this._fetch(response, url)
    } else if (path === '/filter') {
      this._filter(response, url)
    } else if (path === '/log') {
      this._log(response, url)
    } else if (path === '/save') {
      this._save(message, url, response, dataStream)
    } else {
      this._ping(response)
    }
  }

  /**
   * High-performance fetching routine
   * Loads a stream from S3, compresses, and chunks and sends back to the client
   * @param {*} response
   * @param {*} url
   */
  async _fetch (response, url) {
    const encryptedRun = url.query.run
    // If the encrypted run contains a dash, means it is actually not encrypted
    const run = Util.decrypt(encryptedRun)
    console.info(`SERVER HANDLE fetch: ${run}`)

    const s3 = new AWS.S3()
    const s3Stream = await s3.getObject({
      Bucket: 'batch-runner',
      Key: Store.key(run)
    }).createReadStream()

    // Compress the result - got it from here:
    // https://stackoverflow.com/questions/3894794/node-js-gzip-compression
    response.writeHead(200, { 'content-encoding': 'gzip' })
    s3Stream.pipe(zlib.createGzip()).pipe(response)
  }

  async _filter (response, url) {
    const run = url.query.run
    const limit = url.query.limit

    const results = await this.store.filter(run, limit)
    console.info(`SERVER FILTER run ${run}`)
    response.end(JSON.stringify({ jobs: results }, null, 2))
  }

  async _decrypt (response, url) {
    const encryptedKey = url.query.key
    const key = Util.decrypt(encryptedKey)
    console.log(`SERVER HANDLE decrypt: ${encryptedKey} as: ${key}`)
    response.end(JSON.stringify({ decryptedKey: key }, null, 2))
  }

  /**
   *
   * @param {string} url
   * @returns {Job}
   */
  async _fetchJob (url) {
    const encryptedRun = url.query.run
    const run = Util.decrypt(encryptedRun)
    console.info(`SERVER HANDLE fetch: ${run}`)
    return this.store.fetch(run)
  }

  async _log (response, url) {
    const index = url.query.index
    const job = await this._fetchJob(url)
    const result = _.nth(job.results, index)
    console.log(`SERVER HANDLE log: ${index}`)
    response.end(JSON.stringify(result, null, 2))
  }

  async _ping (response) {
    const packageData = fs.readFileSync('package.json')
    const packageJSON = JSON.parse(packageData)
    response.end(`BATCH-TESTER-DATA VERSION: ${packageJSON.version}`)
  }

  /**
   * Saves the data to S3 by piping data from request to AWS
   * @param {*} message
   * @param {*} url
   * @param {*} response
   * @param {*} dataStream
   */
  async _save (message, url, response, dataStream) {
    const run = url.query.run
    const encryptedRun = Util.encrypt(run)

    const s3 = new AWS.S3()
    await s3.upload({
      Body: dataStream,
      Bucket: 'batch-runner',
      Key: Store.key(run)
    }).promise()

    response.end(JSON.stringify({
      key: encryptedRun,
      success: true
    }))
  }
}

module.exports = Server

const command = _.nth(process.argv, 2)
if (command === 'run') {
  const server = new Server()

  server.start().then(() => {
    console.log('SERVER STARTED')
  })
}

process.on('uncaughtException', (e) => {
  console.error('UNCAUGHT: ' + e)
  console.error('UNCAUGHT STACK: ' + e.stack)
})

process.on('unhandledRejection', (e) => {
  console.error('UNHANDLED: ' + e)
  console.error('UNHANDLED: ' + e.stack)
})
