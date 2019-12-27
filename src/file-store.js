const fs = require('fs')
const Job = require('./job').Job
const path = require('path')
const Store = require('./store')

const BASE_PATH = './data'
class FileStore extends Store {
  /**
   * Fetchs a run
   * @param {string} run
   */
  async fetch (run) {
    const runFilePath = path.join(BASE_PATH, FileStore.key(run))
    if (fs.existsSync(runFilePath)) {
      return undefined
    }

    const jobData = fs.readFileSync(runFilePath)
    const jobJSON = JSON.parse(jobData)
    let job = new Job()
    job = Object.assign(job, jobJSON)
    return job
  }

  /**
   * Saves the job to a file
   * @param {Job} job
   */
  async save (job) {
    if (!fs.existsSync(BASE_PATH)) {
      fs.mkdirSync(BASE_PATH)
    }

    const fullPath = path.join(BASE_PATH, FileStore.key(job.run))
    fs.writeFileSync(fullPath, JSON.stringify(job, null, 2))
  }

  static key (run) {
    return run + '.json'
  }
}

module.exports = FileStore
