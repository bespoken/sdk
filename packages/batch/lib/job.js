const _ = require('lodash')
const Client = require('@bespoken-sdk/store/lib/client')
const fs = require('fs')
const JSONUtil = require('@bespoken-sdk/shared/lib/json-util')
const logger = require('@bespoken-sdk/shared/lib/logger')('JOB')
const moment = require('moment')
const Record = require('./record')
const Result = require('./result')

/**
 * Class that manages info and execution of a particular job
 */
class Job {
  /**
   * This routine loads a Job
   * It checks first for it locally - if it's not there, it loads it remotely
   * It then saves it locally for faster access
   * @param {string} key
   * @returns {Promise<Job>}
   */
  static async lazyFetchJobForKey (key) {
    const StoreClient = require('@bespoken-sdk/store/lib/client')
    const store = new StoreClient()
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data')
    }

    // If there is NOT a dash, means this key is in encrypted UUID format
    // We decrypt by calling our server
    let decryptedKey = key
    if (!key.includes('-')) {
      decryptedKey = await store.decrypt(key)
      logger.info('JOB LAZYFETCH decrypted key: ' + decryptedKey)
    }

    let dataFile = `data/${decryptedKey}`
    if (!dataFile.endsWith('.json')) {
      dataFile = `${dataFile}.json`
    }

    let jobJSON
    if (fs.existsSync(dataFile)) {
      jobJSON = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
    } else {
      jobJSON = await store.fetch(key)
      fs.writeFileSync(dataFile, JSON.stringify(jobJSON, null, 2))
    }

    const job = Job.fromJSON(jobJSON)
    return job
  }

  /**
   * Creates a new Job object from JSON
   * @param {Object} json
   * @returns {Job}
   */
  static fromJSON (json) {
    const job = new Job(json.name, json.run, json.config)
    JSONUtil.fromJSON(job, json)
    // Loop through results and turn into objects
    const resultObjects = []
    for (const resultJSON of job._results) {
      const record = Record.fromJSON(resultJSON.record)
      
      const result = new Result(record)

      // We update our new result using defaults because we do not want to overwrite propertie
      _.defaults(result, resultJSON)
      // Make the record property back into a record object - I know, we do similar stuff below :-)
      resultObjects.push(result)
    }
    job._results = resultObjects

    // Loop through the records and turn them into objects
    const records = []
    for (const record of job._records) {
      records.push(Record.fromJSON(record))
    }
    job._records = records
    return job
  }

  /**
   * @param {string} name
   * @param {string | undefined} run
   * @param {any} config
   */
  constructor (name, run, config) {
    const now = moment().utc()
    this._name = name
    if (run) {
      this._run = run
    } else {
      this._run = name + '_' + now.format('YYYY-MM-DDTHH-mm-ss')
    }
    this._timestamp = now.format()
    this._config = config
    this._key = undefined
    this._records = []
    this._results = []
    this._processedCount = 0
    this.totalCount = 0
    this._rerun = false
  }

  /**
   * @returns {any}
   */
  get config () {
    return this._config
  }

  /**
   * The date the job was created (UTC)
   * Saved in ISO 8601 format: YYYY-MM-DDThh:mm:ssZ
   * Eg. 2020-05-21T15:50:13Z
   * @type {string}
   */
  get timestamp () {
    return this._timestamp
  }

  /**
   * @returns {string}
   */
  get customer () {
    return this.config.customer
  }

  /**
   * @returns {string | undefined}
   */
  get key () {
    return this._key
  }
  
  /**
   *
   */
  set key (key) {
    this._key = key
  }

  /**
   * @returns {string}
   */
  get name () {
    return this._name
  }

  /**
   * @returns {number}
   */
  get processedCount () {
    return this._processedCount
  }

  /**
   * @returns {Record[]} The records for the job
   */
  get records () {
    return this._records
  }

  /**
   *
   */
  set records (records) {
    this._records = records
  }
  
  /**
   * @returns {boolean}
   */
   get rerun () {
    return this._rerun
  }

  /**
   * Sets the rerun flag
   */
  set rerun (rerun) {
    this._rerun = rerun
  }
  
  /**
   * @returns {Result[]} The results for the job
   */
  get results () {
    return this._results
  }

  /**
   * The run name
   * @type {string}
   */
  get run () {
    return this._run
  }
  
  /**
   *
   */
  set run (run) {
    this._run = run
  }

  /**
   * @returns {string}
   */
  get status () {
    let recordsToProcess = this.records.length
    const limit = _.get(this, 'config.limit')
    if (limit && limit < recordsToProcess) {
      recordsToProcess = limit
    }
    if (this.processedCount === recordsToProcess) {
      return 'COMPLETED'
    } else {
      return 'NOT_COMPLETED'
    }
  }
  
  /**
   * Captures a result of a record being processed
   * @param {Result} result
   * @returns {void}
   */
  addResult (result) {
    this._results.push(result)
  }

  /**
   * Increments the number of records being processed
   * @param {number} [count] Defaults to 1
   * @returns {void}
   */
  addProcessedCount (count = 1) {
    this._processedCount += count
  }

  /**
   * Iterates across all the results to see all the expected field values
   * @returns {string[]} Return the list of expected field names
   */
  expectedFieldNames () {
    const fields = this._uniqueFields(this._records, 'expectedFields')
    // logger.log(`JOB expectedFields: ${fields}`)
    return fields
  }

  /**
   * @param {number} index
   * @returns {string}
   */
   logURL (index) {
    if (!this.key) {
      return 'N/A'
    }

    return `${Client.accessURL()}/log?run=${this.key}&index=${index}`
  }

  /**
   * @returns {string[]}
   */
  outputFieldNames () {
    // Add output fields from the records as well as the results
    const fields = this._uniqueFields(this._results, 'outputFields')
    // logger.log(`JOB ouputFields: ${fields}`)
    return fields
  }

  /**
   * @returns {any}
   */
  toJSON() {
    return JSONUtil.toJSON(this)
  }

  /**
   * @param {Object[]} recordArray
   * @param {string} resultProperty
   * @returns {string[]}
   */
  _uniqueFields (recordArray, resultProperty) {
    const fields = []
    recordArray.forEach(result => {
      // logger.log(`RESULT ${resultProperty}: ${result[resultProperty]}`)
      Object.keys(result[resultProperty]).forEach(field => {
        if (fields.indexOf(field) === -1) {
          fields.push(field)
        }
      })
    })
    return fields
  }
}

module.exports = Job
