const Config = require('./config')
const Store = require('./store')
const Printer = require('./printer')

class Synchronizer {
  constructor (job, outputPath) {
    this.job = job
    this.outputPath = outputPath
    this.interval = Config.get('saveInterval', undefined, true, 300) * 1000
    this.periodicSave = undefined
  }

  async saveJob (logMessage) {
    try {
      console.time(`BATCH ${logMessage} SAVE`)
      await Printer.instance(this.outputPath).print(this.job)
      console.timeEnd(`BATCH ${logMessage} SAVE`)
      console.info(`BATCH ${logMessage} SAVE completed key: ${this.job.key}`)
    } catch (e) {
      console.error(`BATCH ${logMessage} SAVE error: ` + e)
    }
  }

  runSave () {
    this.stopSave()
    this.periodicSave = setInterval(() => this.saveJob('INTERVAL'), this.interval)
  }

  stopSave () {
    clearInterval(this.periodicSave)
  }
}

module.exports = Synchronizer
