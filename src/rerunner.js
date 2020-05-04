const Config = require('./config')
const { Device, DevicePool } = require('./device')
const fs = require('fs')
const Job = require('./job').Job
const { Record, Source } = require('./source')
const Runner = require('./batch-runner')
const BespokenStore = require('./bespoken-store')
const Util = require('./util')

class Rerunner {
  async rerun (configFile, key, unencryptedKey = false) {
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data')
    }

    if (unencryptedKey) {
      key = Util.encrypt(key)
    }

    const dataFile = `data/${key}.json`
    let jobJSON
    if (fs.existsSync(dataFile)) {
      jobJSON = JSON.parse(fs.readFileSync(dataFile))
    } else {
      const store = new BespokenStore()
      jobJSON = await store.fetch(key)
      fs.writeFileSync(dataFile, JSON.stringify(jobJSON, null, 2))
    }

    Config.loadFromFile(configFile)
    const job = Job.fromJSON(jobJSON)

    Config.singleton('source', new RerunSource(job))
    Config.singleton('device-pool', new RerunDevicePool())

    const runner = new Runner()
    runner.rerun = true
    await runner.process()
  }
}

class RerunSource extends Source {
  constructor (job) {
    super()
    this.job = job
  }

  async loadAll () {
    console.log('RERUN-SOURCE LOADALL records: ' + this.job.results.length)
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
