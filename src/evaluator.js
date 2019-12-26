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
      const fieldResult = Evaluator.evaluateField(field, record, response)
      result.addActualField(field, fieldResult.actual)
      result.success = fieldResult.success && result.success
    }
    return result
  }

  static evaluateField (field, record, response) {
    let actual = response[field]
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
        actual = jsonpath.value(response, expression)
        console.log(`EVAL VALUE: ${actual} JSON-PATH: ${expression}`)
      } catch (e) {
        console.error(`EVAL INVALID JSONPATH: ${expression}`)
      }
    }
    const expected = record.expectedFields[field]
    console.log(`EVAL FIELD: ${field} VALUE: ${actual} EXPECTED: ${expected}`)

    const fieldResult = {
      actual,
      expected,
      success: false
    }

    // If expected is *, we accept anything
    if (expected.trim() === '*') {
      fieldResult.success = true
      return fieldResult
    } else if (actual) {
      let expectedValues = [expected]
      if (expected.indexOf('|') !== -1) {
        expectedValues = expected.split('|')
      }

      // If there is an actual value, do a partial match on it
      let match = false
      for (const expectedValue of expectedValues) {
        if (actual.toLowerCase().includes(expectedValue.trim().toLowerCase())) {
          match = true
          break
        }
      }
      fieldResult.success = match
    }

    return fieldResult
  }
}

module.exports = Evaluator
