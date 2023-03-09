const Config = require('@bespoken-sdk/shared/lib/config')
const Client = require('@bespoken-sdk/store/lib/client')
const Job = require('./job')
const logger = require('@bespoken-sdk/shared/lib/logger')('SYNC')

/**
 *
 */
class Synchronizer {
  /**
   * @param {Job} job
   */
  constructor (job) {
    this.job = job

    const jobFields=JSON.parse(JSON.stringify(job) )

    const tokens = Object.keys(jobFields.config.virtualDevices)
    tokens.forEach(token => {
      jobFields.config.virtualDevices[token].settings.serverInterceptor = 'Generated on the fly'
    })

    this.jobPureFields = jobFields
    this.interval = Config.get('saveInterval', true, 300) * 1000
    this.periodicSave = undefined
  }

  /**
   * @param {string} logMessage
   * @returns {Promise<void>}
   */
  async saveJob (logMessage) {
    // We have this check in other places, but just to make sure, we put it here as well
    // We do NOT want to accidentally overwrite our data on reruns
    if (this.job.rerun) {
      return
    }

    try {
      logger.time(`BATCH ${logMessage} SAVE`)

      const client = new Client()
      const encryptedKey = await client.save(this.job.run, this.jobPureFields)
      this.job.key = encryptedKey
      logger.timeEnd(`BATCH ${logMessage} SAVE`)
      logger.info(`BATCH ${logMessage} SAVE completed key: ${this.job.key}`)
    } catch (e) {
      logger.timeEnd(`BATCH ${logMessage} SAVE`)
      logger.error('BATCH ' + e.stack)
      logger.error(`BATCH ${logMessage} SAVE error: ` + e)
    }
  }

  /**
   * @returns {void}
   */
  runSave () {
    // We do not save intermittently for re-runs
    if (this.job.rerun) {
      return
    }

    this.stopSave()
    this.periodicSave = setInterval(() => this.saveJob('INTERVAL'), this.interval)
  }

  /**
   * @returns {void}
   */
  stopSave () {
    if (!this.periodicSave) {
      return
    }

    clearInterval(this.periodicSave)
  }
}

module.exports = Synchronizer
