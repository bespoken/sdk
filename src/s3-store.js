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

  async filter (run, limit) {
    console.time('S3-STORE FILTER')
    const s3 = new AWS.S3()
    const response = await s3.listObjectsV2({
      Bucket: 'batch-runner',
      Prefix: run
    }).promise()
    const matching = response.Contents

    // Sort records by descending date
    let matchingSorted = matching.sort((o1, o2) => {
      return o2.LastModified.getTime() - o1.LastModified.getTime()
    })

    if (limit) {
      matchingSorted = matchingSorted.slice(0, limit)
    }
    const promises = []
    for (const object of matchingSorted) {
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
        key: j._key,
        processedCount: j.processedCount,
        recordCount: j.records.length,
        run: j.run,
        status: j.status,
        timestamp: j.date
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
