const AWS = require('aws-sdk')
const Job = require('./job').Job
const Store = require('./store')
const { Route53Resolver } = require('aws-sdk')

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

  async filter (run) {
    console.time('S3-STORE FILTER')
    const s3 = new AWS.S3()
    const response = await s3.listObjectsV2({
      Bucket: 'batch-runner',
      Prefix: run
    }).promise()
    const matching = response.Contents

    const promises = []
    for (const object of matching) {
      console.info(JSON.stringify(object, null, 2))
      promises.push(s3.getObject({
        Bucket: 'batch-runner',
        Key: object.Key
      }).promise().then((response) => {
        const jobData = response.Body
        const jobJSON = JSON.parse(jobData)
        const job = Job.fromJSON(jobJSON)
        console.info(`S3STORE FILTER job: ${job._run} records: ${job.records.length} processed: ${job.processedCount} limit: ${job._config.limit}`)
        return Promise.resolve(job)
      }))
    }

    // Wait until all objects are loaded
    const jobs = await Promise.all(promises)
    console.timeEnd('S3-STORE FILTER')

    // Create an array of metadata about the jobs - we don't return the full payload
    return jobs.map(j => {
      return {
        key: j.key,
        processedCount: j.processedCount,
        run: j.run,
        status: j.status
      }
    })
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
