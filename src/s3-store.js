const AWS = require('aws-sdk')
const Job = require('./job')
const Store = require('./store')

class S3Store extends Store {
  async fetch (run) {
    const s3 = new AWS.S3()
    const response = await s3.getObject({
      Bucket: 'batch-runner',
      Key: S3Store.key(run)
    }).promise()

    const jobData = response.Data
    if (!jobData) {
      return undefined
    }
    const job = new Job()
    Object.assign(jobData, job)
    return job
  }

  async save (job) {
    const s3 = new AWS.S3()
    return s3.putObject({
      Body: JSON.stringify(job, null, 2),
      Bucket: 'batch-runner',
      Key: S3Store.key(job.run)
    }).promise()
  }

  static key (run) {
    return run + '.json'
  }
}

module.exports = S3Store
