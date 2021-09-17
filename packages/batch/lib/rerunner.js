const _ = require('lodash')
const BespokenStore = require('@bespoken-sdk/store').Client
const Config = require('@bespoken-sdk/shared/lib/config')
const { Device, DevicePool } = require('./device')
const fs = require('fs')
const Job = require('./job').Job
const Record = require('./source').Record
const Runner = require('./batch-runner')
const Source = require('./source').Source
const Util = require('./util')

/**
 *
 */
class Rerunner {
  /**
   * @param configFile
   * @param key
   * @param outputPath
   */
  constructor (configFile, key, outputPath) {
    this.configFile = configFile
    this.key = key
    this.outputPath = outputPath
  }

  /**
   * @param runName
   * @param limit
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
   * @param runName
   * @param status
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
   *
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
   * @param job
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
   * @param record
   */
  lock (record) {
    this.inUse = true
    return new RerunDevice(record)
  }

  /**
   *
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
   * @param record
   */
  constructor (record) {
    super('rerun-device')
    this.record = record
  }

  /**
   * @param message
   */
  async message (message) {
    return this.record.responses
  }
}

module.exports = Rerunner
