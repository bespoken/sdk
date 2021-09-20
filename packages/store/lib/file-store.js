const fs = require('fs')
const path = require('path')
const Store = require('./store')

const BASE_PATH = './data'
/**
 *
 */
class FileStore extends Store {
  /**
   * Fetchs a run
   * @param {string} run
   * @returns {Promise<any>}
   */
  async fetch (run) {
    const runFilePath = path.join(BASE_PATH, Store.key(run))
    const normalizedPath = path.normalize(runFilePath)
    console.log(`FILESTORE FETCH ${runFilePath} FOUND: ${fs.existsSync(runFilePath)} NORMAL: ${normalizedPath}`)
    if (!fs.existsSync(runFilePath)) {
      console.error(`FILESTORE FETCH not found ${runFilePath}`)
      return undefined
    }

    const jobData = fs.readFileSync(runFilePath, 'utf-8')
    const jobJSON = JSON.parse(jobData)
    const job = Job.fromJSON(jobJSON)
    return job
  }

  /**
   * Saves the job to a file
   * @param {any} job
   * @returns {Promise<string>}
   */
  async save (job) {
    if (!fs.existsSync(BASE_PATH)) {
      fs.mkdirSync(BASE_PATH)
    }

    const fullPath = path.join(BASE_PATH, Store.key(job.run))
    fs.writeFileSync(fullPath, JSON.stringify(job, null, 2))
    return job.run
  }
}

module.exports = FileStore
