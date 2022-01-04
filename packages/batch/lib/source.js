const _ = require('lodash')
const Config = require('@bespoken-sdk/shared/lib/config')
const logger = require('@bespoken-sdk/shared/lib/logger')('SOURCE')
const Record = require('./record')

/**
 * Abstract class that defines contract for record sources
 */
class Source {
  /**
   * Gets the source singleton
   * @returns {Source}
   */
  static instance () {
    return Config.instance('source', './csv-source')
  }

  /**
   * Filters records based on configuration
   * The filters are set in the config as a key and set of values, such as:
   * ```
   * filters: {
   *   property: ['value1', 'value2'],
   * }
   * ```
   * The property is taken from the `meta` attribute of the record
   * @param {Record[]} records
   * @returns {Record[]} The records after the filter is applied
   */
  filter (records) {
    if (Config.has('filters')) {
      const filteredRecords = []
      const filters = Config.get('filters')
      logger.info(`FILTER properties: ${Object.keys(filters)}`)

      // Apply the filter to the records
      for (const record of records) {
        let match = true
        for (const filterProperty of Object.keys(filters)) {
          let values = filters[filterProperty]
          // If the values element is not an array, make it into one
          if (!Array.isArray(values)) {
            values = [values]
          }

          let value = _.get(record.meta, filterProperty)
          if (!value) {
            console.log(`FILTER skipping: ${record.utterance} reason: ${filterProperty} is undefined`)
            match = false
            break
          }

          value += '' // Turn everything into a string for ease of comparison
          match = values.find(v => {
            v += ''
            return v.trim().toLowerCase() === value.trim().toLowerCase()
          })

          if (!match) {
            console.log(`FILTER skipping: ${record.utterance} reason: ${filterProperty} = ${value}`)
            break
          }
        }

        if (match) {
          filteredRecords.push(record)
        }
      }
      return filteredRecords
    } else {
      return records
    }
  }

  /**
   * Loads all records - this function must be implemented by subclasses
   * @returns {Promise<Record[]>} The records to be processed
   */
  async loadAll () {
    throw new Error('No-op - must be implemented by subclass')
  }

  /**
   * Called just before the record is processed - for last minute operations
   * @abstract
   * @param {Record} record
   * @returns {Promise<void>}
   */
  async loadRecord (record) {
    logger.debug('loading record - noop for record: ' + record.utterance)
    return Promise.resolve()
  }
}

module.exports = Source
