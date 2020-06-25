const Config = require('./config')
const { Device, DevicePool } = require('./device')
const fs = require('fs')
const Job = require('./job').Job
const { Source } = require('./source')
const Runner = require('./batch-runner')
const BespokenStore = require('./bespoken-store')
const Util = require('./util')

class Rerunner {
  constructor (configFile, key, unencryptedKey = false, outputPath) {
    this.configFile = configFile
    this.key = key
    this.unencryptedKey = unencryptedKey
    this.outputPath = outputPath
  }

  async rerun () {
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data')
    }

    if (this.unencryptedKey) {
      this.key = Util.encrypt(this.key)
    }

    const dataFile = `data/${this.key}.json`
    let jobJSON
    if (fs.existsSync(dataFile)) {
      jobJSON = JSON.parse(fs.readFileSync(dataFile))
    } else {
      const store = new BespokenStore()
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
      record.lastResponse = result.lastResponse
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
    return [this.record.lastResponse]
  }
}

module.exports = Rerunner
