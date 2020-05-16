const AWS = require('aws-sdk')
const Job = require('./job').Job
const Store = require('./store')

class S3Store extends Store {
  async fetch (run) {
    console.time('S3Store.fetch')
    const s3 = new AWS.S3()
    const response = await s3.getObject({
      Bucket: 'batch-runner',
      Key: Store.key(run)
    }).promise()
    console.timeEnd('S3Store.fetch')

    // console.log('S3 JOB KEY: ' + S3Store.key(run) + ' RESPONSE: ' + JSON.stringify(response.Body, null, 2))
    const jobData = response.Body
    if (!jobData) {
      return undefined
    }

    const jobJSON = JSON.parse(jobData)
    const job = Job.fromJSON(jobJSON)
    return job
  }

  async save (job) {
    console.time('S3-STORE SAVE')
    const s3 = new AWS.S3()
    await s3.putObject({
      Body: JSON.stringify(job, null, 2),
      Bucket: 'batch-runner',
      Key: Store.key(job.run)
    }).promise()
    console.timeEnd('S3-STORE SAVE')
    return job.run
  }
}

module.exports = S3Store
