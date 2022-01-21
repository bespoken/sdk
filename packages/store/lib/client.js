const _ = require('lodash')
const axios = require('axios').default
const logger = require('@bespoken-sdk/shared/lib/logger')('STORE')
const Readable = require('stream').Readable
const zlib = require('zlib')

/**
 *
 */
class Client  {
  /**
   * @returns {string}
   */
  static accessURL () {
    return process.env.STORE_URL ? process.env.STORE_URL : 'https://store.bespoken.io/store'
  }

  /**
   * @param {string} run
   * @returns {Promise<any>}
   */
  async fetch (run) {
    logger.time('FETCH')
    const url = `${Client.accessURL()}/fetch?run=${run}`
    logger.info(`FETCH run: ${run} url: ${url}`)

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
        logger.info(`FETCH downloaded: ${bufferLength}M`)
        previousLength = bufferLength
      }
    })

    return new Promise((resolve) => {
      streamResponse.data.on('end', () => {
        logger.timeEnd('FETCH')
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
    logger.time('FILTER')
    const url = `${Client.accessURL()}/filter?run=${runName}&limit=${limit}`

    const response = await axios.get(url)
    const jobs = response.data.jobs
    logger.timeEnd('FILTER')
    return jobs
  }

  /**
   * @param {string} key
   * @param {any} json
   * @returns {Promise<string>} The UUID assigned to the job
   */
  async save (key, json) {
    logger.time('SAVE')
    const url = `${Client.accessURL()}/save?key=${key}`

    const jsonString = JSON.stringify(json)
    // Create a stream from the JSON
    const jsonStream = Readable.from(jsonString)
    const gzipStream = jsonStream.pipe(zlib.createGzip())
    const response = await axios.post(url, gzipStream, {
      headers: {
        'Content-Encoding': 'gzip'
      },
      maxContentLength: (200 * 1024 * 1024), // up to 200 mb - biggest file so far is 57 MB
      responseType: 'json'
    })

    logger.timeEnd('SAVE')
    return response.data.key
  }

  /**
   * @param {string} key
   * @returns {Promise<string>}
   */
  async decrypt (key) {
    const url = `${Client.accessURL()}/decrypt?key=${key}`
    logger.info('decrypt: ' + url)
    const response = await axios.get(url)
    return response.data.decryptedKey
  }
}

module.exports = Client