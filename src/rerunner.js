const Config = require('./config')
const { Device, DevicePool } = require('./device')
const fs = require('fs')
const Job = require('./job').Job
const { Source } = require('./source')
const Runner = require('./batch-runner')
const BespokenStore = require('./bespoken-store')
const Util = require('./util')

class Rerunner {
  constructor (configFile, key, outputPath) {
    this.configFile = configFile
    this.key = key
    this.outputPath = outputPath
  }

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

  async rerun () {
    const store = new BespokenStore()
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data')
    }

    // If there is NOT a dash, means this key is in encrypted UUID format
    // We decrypt by calling our server
    let decryptedKey = this.key
    if (!this.key.includes('-')) {
      decryptedKey = await store.decrypt(this.key)
      console.info('RERUNNER RERUN decrypted key: ' + this.key)
    }

    let dataFile = `data/${decryptedKey}`
    if (!dataFile.endsWith('.json')) {
      dataFile = `${dataFile}.json`
    }

    let jobJSON
    if (fs.existsSync(dataFile)) {
      jobJSON = JSON.parse(fs.readFileSync(dataFile))
    } else {
      jobJSON = await store.fetch(this.key)
      fs.writeFileSync(dataFile, JSON.stringify(jobJSON, null, 2))
    }

    Config.loadFromFile(this.configFile)
    const job = Job.fromJSON(jobJSON)

    Config.singleton('source', new RerunSource(job))
    Config.singleton('device-pool', new RerunDevicePool())

    const runner = new Runner(undefined, this.outputPath)

    runner.rerun = true
    runner.rerunKey = this.key
    await runner.process()
  }
}

class RerunSource extends Source {
  constructor (job) {
    super()
    this.job = job
  }

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

class RerunDevicePool extends DevicePool {
  constructor () {
    super()
    this.inUse = false
  }

  lock (record) {
    this.inUse = true
    return new RerunDevice(record)
  }

  free () {
    this.inUse = false
  }
}

class RerunDevice extends Device {
  constructor (record) {
    super('rerun-device')
    this.record = record
  }

  async message (message) {
    return this.record.responses
  }
}

module.exports = Rerunner
