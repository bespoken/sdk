const _ = require('lodash')
const fs = require('fs')
const http = require('http')
const Job = require('../src/job').Job
const { Readable } = require('stream')
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
        let data = Buffer.alloc(0)
        this.buffer = message.on('data', (chunk) => {
          // console.log('Buffer: ' + chunk)
          data = Buffer.concat([data, chunk])
        })

        message.on('end', async () => {
          this._handleRequest(message, response, data)
        })
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

  _handleRequest (message, response, data) {
    const url = URL.parse(message.url, true) /* eslint-disable-line */
    const path = url.pathname

    if (path === '/fetch') {
      this._fetch(response, url)
    } else if (path === '/log') {
      this._log(response, url)
    } else if (path === '/save') {
      this._save(message, response, data)
    } else {
      this._ping(response)
    }
  }

  async _fetch (response, url) {
    const job = await this._fetchJob(url)
    const jobString = JSON.stringify(job, null, 2)

    // Compress the result - got it from here:
    // https://stackoverflow.com/questions/3894794/node-js-gzip-compression
    response.writeHead(200, { 'content-encoding': 'gzip' })
    const stream = Readable.from(jobString)
    stream.pipe(zlib.createGzip()).pipe(response)
  }

  /**
   *
   * @param {string} url
   * @returns {Job}
   */
  async _fetchJob (url) {
    const encryptedRun = url.query.run
    const run = Util.decrypt(encryptedRun)
    console.log(`SERVER HANDLE fetch: ${run}`)
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

  async _save (message, response, data) {
    if (message.headers['content-encoding']) {
      return new Promise((resolve, reject) => {
        zlib.gunzip(data, (error, unzippedData) => {
          console.log(`SERVER SAVE zipped size: ${Math.round(data.length / 1024 / 1024)}M unzipped: ${Math.round(unzippedData.length / 1024 / 1024)}M`)
          if (error) {
            reject(error)
            return
          }
          return this._saveJSON(response, unzippedData)
        })
      })
    } else {
      return this._saveJSON(response, data)
    }
  }

  async _saveJSON (response, jsonData) {
    let json = {}
    if (jsonData.length > 0) {
      json = JSON.parse(jsonData)
    }

    const job = Job.fromJSON(json)
    const key = job.run

    console.log(`SERVER HANDLE save key: ${key}`)
    await this.store.save(job)

    const encryptedKey = Util.encrypt(key)
    response.end(JSON.stringify({
      key: encryptedKey,
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
