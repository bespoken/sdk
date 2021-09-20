const _ = require('lodash')
const Config = require('@bespoken-sdk/shared/lib/config')
const DTO = require('@bespoken-sdk/store/lib/dto')
const fs = require('fs')
const JobDTO = require('@bespoken-sdk/store/lib/job-dto')
const logger = require('@bespoken-sdk/shared/lib/logger')('JOB')
const Record = require('./source').Record
const moment = require('moment')

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
    const StoreClient = require('@bespoken-sdk/store').Client
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
   * 
   * @param {DTO} dto
   * @returns {Job} job
   */
  static fromDTO(dto) {
    return Job.fromJSON(dto.json)
  }

  /**
   * Creates a new Job object from JSON
   * @param {Object} json
   * @returns {Job}
   */
  static fromJSON (json) {
    const job = new Job(json.name, json.run)
    Object.assign(job, json)
    // Loop through results and turn into objects
    const resultObjects = []
    for (const result of job._results) {
      const o = new Result()
      Object.assign(o, result)
      // Make the record property back into a record object - I know, we do similar stuff below :-)
      o._record = Record.fromJSON(result._record)
      resultObjects.push(o)
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
   * @param {string} run
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
    this._date = now.format()
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
  get date () {
    return this._date
  }

  /**
   * @returns {string}
   */
  get customer () {
    return this.config.customer
  }

  /**
   * @returns {string}
   */
  get key () {
    return this._key
  }
  
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
   * @returns {string[]}
   */
  outputFieldNames () {
    // Add output fields from the records as well as the results
    const fields = this._uniqueFields(this._results, 'outputFields')
    // logger.log(`JOB ouputFields: ${fields}`)
    return fields
  }

  /**
   * @returns {DTO}
   */
  toDTO() {
    return new JobDTO(this)
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

/**
 * The result for a particular record
 */
class Result {
  /**
   *
   * @param {Record} [record]
   * @param {string} [voiceId]
   * @param {Object[]} [responses]
   * @param {number} [retryCount]
   */
  constructor (record, voiceId, responses, retryCount = 0) {
    this._record = record
    this._voiceId = voiceId
    this._responses = responses
    this._retryCount = retryCount

    /** @type {Object<string, string>} */
    this._actualFields = {}

    /** @type {Object<string, string>} */
    this._outputFields = {}
    
    /** @type {Object<string, string>} */
    this._tags = {}
    
    this._timestamp = Date.now()
    this._shouldRetry = false
  }

  /**
   *
   * @param {string} field
   * @returns {string} The value for the field
   */
  actualField (field) {
    return this._actualFields[field]
  }

  /**
   * Adds the actual value for an expected field to the result
   * @param {string} field The name of the field
   * @param {string} value The value of the field
   * @returns {void}
   */
  addActualField (field, value) {
    this._actualFields[field] = value
  }

  /**
   * Adds a field to the output results - these are fields that are not expected or actual but are helpful info about the record
   * @param {string} field The name of the field
   * @param {string} value The value of the field
   * @returns {void}
   */
  addOutputField (field, value) {
    this._outputFields[field] = value
  }

  /**
   * @param {string} key
   * @param {string} value
   * @returns {void}
   */
  addTag (key, value) {
    this._tags[key] = value
  }

  /**
   * Gets a specific output field
   * @param {string} field
   * @returns {string} The value of the field
   */
  outputField (field) {
    return this.outputFields[field]
  }

  /**
   * @returns {Object<string, string>}
   */
  get actualFields () {
    return this._actualFields
  }

  /**
   * @returns {string}
   */
  get error () {
    return this._error
  }
  
  set error (error) {
    this._error = error
  }

  /**
   * @returns {any}
   */
  get lastResponse () {
    return _.nth(this.responses, -1)
  }

  /**
   * @returns {any[]}
   */
  get responses () {
    return this._responses
  }

  /**
   * @returns {Object<string, string>}
   */
  get outputFields () {
    // We concatenate the output fields from the record and the result
    /** @type {Object<string, string>} */
    const outputFields = {}
    if (this.record) {
      Object.assign(outputFields, this.record.outputFields)
    }
    Object.assign(outputFields, this._outputFields)
    return outputFields
  }

  /**
   * @returns {Record}
   */
  get record () {
    return this._record
  }

  /**
   * @returns {string[]}
   */
  get sanitizedOcrLines () {
    const homophones = Config.get('homophones', false, {})
    const ocrLines = _.get(this.lastResponse, 'raw.ocrJSON.TextDetections', [])
      .filter(text => text.Type === 'LINE')

    Object.keys(homophones).forEach(expectedString => {
      homophones[expectedString].forEach(homophone => {
        ocrLines.forEach((item, index) => {
          ocrLines[index].DetectedText = item.DetectedText.replace(new RegExp(homophone, 'gi'), expectedString)
        })
      })
    })

    return ocrLines
  }

  /**
   * @type {boolean}
   */
  get success () {
    return this._success
  }

  /**
   *
   */
  set success (success) {
    this._success = success
  }

  /**
   * @returns {Object<string, string>}
   */
  get tags () {
    return this._tags
  }

  /**
   * @returns {number}
   */
  get timestamp () {
    return this._timestamp
  }

  /**
   * @returns {boolean}
   */
  get shouldRetry () {
    return this._shouldRetry
  }

  /**
   *
   */
  set shouldRetry (shouldRetry) {
    this._shouldRetry = shouldRetry
  }

  /**
   * @returns {number}
   */
  get retryCount () {
    return this._retryCount
  }

  set retryCount (retryCount) {
    this._retryCount = retryCount
  }
}

module.exports = { Job, Result }
