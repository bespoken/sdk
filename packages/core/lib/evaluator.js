const jsonpath = require('jsonpath')
const Config = require('./config')
const Record = require('./source').Record
const Result = require('./job').Result

/**
 * The evaluator class encapsulates logic to determine if a particular record passed its tests
 */
class Evaluator {
  /**
   * Runs through all the fields defined in the CSV record and compares them to actual
   * @param {Record} record
   * @param {Result} result
   * @param {Object} response
   */
  static evaluate (record, result, response) {
    result.success = true

    for (const field in record.expectedFields) {
      // Skip utterance and meta as protected fields
      const fieldResult = Evaluator.evaluateExpectedField(field, record, response)
      result.addActualField(field, fieldResult.actual)
      result.success = fieldResult.success && result.success
    }

    const configFields = Config.get('fields') || []
    Object.keys(configFields)
      .filter(field => !(field in record.expectedFields))
      .forEach(field => {
        const fieldResult = Evaluator.jsonQuery(field, response).join()
        result.addOutputField(field, fieldResult)
      })

    return result
  }

  static evaluateExpectedField (field, record, response) {
    const actual = Evaluator.jsonQuery(field, response)
    const expected = record.expectedFields[field]
    console.log(`EVAL EXPECTED-FIELD: ${field} VALUE: ${actual} EXPECTED: ${expected}`)

    const fieldResult = {
      actual: actual.join(),
      expected,
      success: false
    }

    // If expected is *, we accept anything
    if (expected.trim() === '*') {
      fieldResult.success = true
      return fieldResult
    } else if (fieldResult.actual) {
      let expectedValues = [expected]
      if (expected.indexOf('|') !== -1) {
        expectedValues = expected.split('|')
      }

      expectedValues = expectedValues.map(value => value.trim().toLowerCase())

      // If there is an actual value, do a partial match on it
      const match = actual.some(value => expectedValues.includes(value.toLowerCase()))
      fieldResult.success = match
    }

    return fieldResult
  }

  static jsonQuery (field, response) {
    let actual = [response[field]]
    // Check if there is a json path expression defined for the field
    // We can set custom JSON path expressions for fields in the config file like so
    //   "<COLUMN_NAME>": "<JSON_PATH>"
    // For example:
    //   "fields": {
    //     "imageURL": "$.raw.messageBody.directives[4].payload.content.art.sources[0].url"
    //   }
    const key = `fields.${field}`
    if (Config.has(key)) {
      const expression = Config.get(key)

      try {
        actual = jsonpath.query(response, expression)
      } catch (e) {
        console.error(`EVAL INVALID JSONPATH: ${expression}`)
      }

      console.log(`EVAL FIELD: ${field} VALUE: ${actual} JSON-PATH: ${expression}`)
    }

    return actual
  }
}

module.exports = Evaluator
