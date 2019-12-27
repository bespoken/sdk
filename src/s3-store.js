const AWS = require('aws-sdk')
const Job = require('./job').Job
const Store = require('./store')

class S3Store extends Store {
  async fetch (run) {
    const s3 = new AWS.S3()
    const response = await s3.getObject({
      Bucket: 'batch-runner',
      Key: S3Store.key(run)
    }).promise()

    // console.log('S3 JOB KEY: ' + S3Store.key(run) + ' RESPONSE: ' + JSON.stringify(response.Body, null, 2))
    const jobData = response.Body
    if (!jobData) {
      return undefined
    }

    const jobJSON = JSON.parse(jobData)
    let job = new Job()
    job = Object.assign(job, jobJSON)
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
