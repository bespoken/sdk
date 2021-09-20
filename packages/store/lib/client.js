const _ = require('lodash')
const axios = require('axios').default
const DTO = require('./dto')
const Readable = require('stream').Readable
const Store = require('./store')
const zlib = require('zlib')

/**
 *
 */
class Client extends Store {
  /**
   * @param {string} run
   * @returns {Promise<DTO>}
   */
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

    // Print out the download progress in 1 MB intervals
    let previousLength = 0
    streamResponse.data.on('data', (b) => {
      buffer = Buffer.concat([buffer, b])
      const bufferLength = _.round(buffer.length / 1024 / 1024, 0)
      if (bufferLength !== previousLength) {
        console.info(`BESPOKEN-STORE FETCH downloaded: ${bufferLength}M`)
        previousLength = bufferLength
      }
    })

    return new Promise((resolve) => {
      streamResponse.data.on('end', () => {
        console.timeEnd('BESPOKEN-STORE FETCH')
        const jobJSON = JSON.parse(buffer.toString('utf-8'))
        resolve(jobJSON)
      })
    })
  }

  /**
   * @param {string} runName
   * @param {number} limit
   * @returns {Promise<any[]>}
   */
  async filter (runName, limit = 10) {
    console.time('BESPOKEN-STORE FILTER')
    const url = `${this.accessURL()}/filter?run=${runName}&limit=${limit}`

    const response = await axios.get(url)
    const jobs = response.data.jobs
    console.timeEnd('BESPOKEN-STORE FILTER')
    return jobs
  }

  /**
   * @param {any} job
   * @returns {Promise<string>} The UUID assigned to the job
   */
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

  /**
   * @returns {string}
   */
  accessURL () {
    return process.env.STORE_URL ? process.env.STORE_URL : 'https://batch-tester.bespoken.io'
  }

  /**
   * @param {string} key
   * @returns {Promise<string>}
   */
  async decrypt (key) {
    const url = `${this.accessURL()}/decrypt?key=${key}`
    const response = await axios.get(url)
    return response.data.decryptedKey
  }

  /**
   * @param {DTO} dto
   * @param {number} index
   * @returns {string}
   */
  logURL (dto, index) {
    if (!dto.key) {
      return 'N/A'
    }

    return `${this.accessURL()}/log?run=${dto.key}&index=${index}`
  }
}

module.exports = Client