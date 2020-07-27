const Config = require('./config')
const Store = require('./store')

class Synchronizer {
  constructor (job, outputPath) {
    this.job = job
    this.outputPath = outputPath
    this.interval = Config.get('saveInterval', undefined, true, 300) * 1000
    this.periodicSave = undefined
  }

  async saveJob (logMessage) {
    // We have this check in other places, but just to make sure, we put it here as well
    // We do NOT want to accidentally overwrite our data on reruns
    if (this.job.rerun) {
      return
    }

    try {
      console.time(`BATCH ${logMessage} SAVE`)

      await Store.instance().save(this.job)
      console.timeEnd(`BATCH ${logMessage} SAVE`)
      console.info(`BATCH ${logMessage} SAVE completed key: ${this.job.key}`)
    } catch (e) {
      console.error(`BATCH ${logMessage} SAVE error: ` + e)
    }
  }

  runSave () {
    // We do not save intermittently for re-runs
    if (this.job.rerun) {
      return
    }

    this.stopSave()
    this.periodicSave = setInterval(() => this.saveJob('INTERVAL'), this.interval)
  }

  stopSave () {
    if (!this.periodicSave) {
      return
    }

    clearInterval(this.periodicSave)
  }
}

module.exports = Synchronizer
