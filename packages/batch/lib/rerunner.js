const _ = require('lodash')
const BespokenStore = require('@bespoken-sdk/store/lib/client')
const Config = require('@bespoken-sdk/shared/lib/config')
const { Device, DevicePool } = require('./device')
const Job = require('./job')
const Record = require('./record')
const Runner = require('./batch-runner')
const Source = require('./source')

/**
 *
 */
class Rerunner {
  /**
   * @param {string} configFile
   * @param {string} key
   * @param {string} outputPath
   */
  constructor (configFile, key, outputPath) {
    this.configFile = configFile
    this.key = key
    this.outputPath = outputPath
  }

  /**
   * @param {string} runName
   * @param {number} limit
   * @returns {Promise<void>}
   */
  async list (runName, limit) {
    const store = new BespokenStore()
    const jobs = await store.filter(runName, limit)

    process.stdout.write(`${_.padEnd('JOB', 40)}${_.padEnd('RECORDS', 10)}${_.padEnd('PROCESSED', 10)}${_.padEnd('STATUS', 15)} KEY\n`)
    jobs.forEach((job) => {
      process.stdout.write(`${_.padEnd(job.run, 40)}${_.padEnd(job.recordCount, 10)}${_.padEnd(job.processedCount, 10)}${_.padEnd(job.status, 15)} ${job.key}\n`)
    })
  }

  /**
   * @param {string} runName
   * @param {string} status
   * @returns {Promise<void>}
   */
  async rerunMany (runName, status = 'COMPLETED') {
    const store = new BespokenStore()
    const jobs = await store.filter(runName)
    console.info('JOBS: ' + JSON.stringify(jobs, null, 2))
    const filteredJobs = jobs.filter(j => j.status === status)
    for (const job of filteredJobs) {
      const rerunner = new Rerunner(this.configFile, job.key, `output/${job.run}.csv`)
      await rerunner.rerun()
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async rerun () {
    const job = await Job.lazyFetchJobForKey(this.key)
    Config.loadFromFile(this.configFile)
    Config.singleton('source', new RerunSource(job))
    Config.singleton('device-pool', new RerunDevicePool())

    const runner = new Runner(undefined, this.outputPath)

    runner.originalJob = job
    await runner.process()
  }
}

/**
 *
 */
class RerunSource extends Source {
  /**
   * @param {Job} job
   */
  constructor (job) {
    super()
    this.job = job
  }

  /**
   * @returns {Promise<Record[]>}
   */
  async loadAll () {
    console.info('RERUN-SOURCE LOADALL records: ' + this.job.results.length)
    // Take the results, and turn them back into records
    // Set the response from the assistant on the record
    const records = this.job.results.map((result) => {
      const record = result.record
      record.rerun = true
      // @ts-ignore
      record.responses = result.responses
      return record
    })
    return records
  }
}

/**
 *
 */
class RerunDevicePool extends DevicePool {
  /**
   *
   */
  constructor () {
    super()
    this.inUse = false
  }

  /**
   * @param {Record} record
   * @returns {Promise<Device>}
   */
  async lock (record) {
    this.inUse = true
    return new RerunDevice(record)
  }

  /**
   * @returns {void}
   */
  free () {
    this.inUse = false
  }
}

/**
 *
 */
class RerunDevice extends Device {
  /**
   * @param {Record} record
   */
  constructor (record) {
    super('rerun-device', undefined, undefined, undefined)
    this.record = record
  }

  /**
   * @param {string} message
   * @returns {Promise<Response[]>}
   */
  async message (message) {
    return this.record.responses
  }
}

module.exports = Rerunner
