const AWS = require('aws-sdk')
const Job = require('./job').Job
const NodeCache = require('node-cache')
const Store = require('./store')

class S3Store extends Store {
  constructor () {
    super()
    // Cache for completed jobs
    this.jobCache = new NodeCache({
      stdTTL: 60 * 60 // Standard TTL is 1 hour
    })
  }

  async fetch (run) {
    const cachedJob = this.jobCache.get(Store.key(run))
    if (cachedJob) {
      return cachedJob
    }

    console.time('S3Store.fetch' + run)
    const s3 = new AWS.S3()
    const response = await s3.getObject({
      Bucket: 'batch-runner',
      Key: Store.key(run)
    }).promise()
    console.timeEnd('S3Store.fetch' + run)

    // console.log('S3 JOB KEY: ' + S3Store.key(run) + ' RESPONSE: ' + JSON.stringify(response.Body, null, 2))
    const jobData = response.Body
    if (!jobData) {
      return undefined
    }

    const jobJSON = JSON.parse(jobData)
    const job = Job.fromJSON(jobJSON)

    // Added completed jobs to the cache
    if (job.status === 'COMPLETED') {
      this.jobCache.set(Store.key(run), job)
    }
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
      promises.push(this.fetch(object.Key))
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
