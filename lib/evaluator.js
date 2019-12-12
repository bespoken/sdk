const jsonpath = require('jsonpath')
const Config = require('./config')

// Logic for evaluating whether or not a particular test passed
class Evaluator {
  // Runs through all the fields defined in the CSV record and compares them to actuals
  static evaluate (utterance, record, response) {
    const result = {
      success: true
    }

    for (const field in record) {
      if (field !== 'utterance') {
        const fieldResult = Evaluator.evaluateField(field, record, response)
        result[field] = fieldResult
        result.success = fieldResult.success && result.success
      }
    }
    return result
  }

  static evaluateField (field, record, response) {
    let actual = response[field]
    // Check if there is a json path expression defined for the field
    // We can set custom JSON path expressions for fields as environment variables like this:
    //  FIELD.<FIELD_NAME>=<JSON_PATH>
    // For example:
    //  FIELD.imageURL=$.raw.messageBody.directives[4].payload.content.art.sources[0].url
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
    const expected = record[field]
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
      // If there is an actual value, do a partial match on it
      fieldResult.success = actual.toLowerCase().includes(expected.toLowerCase())
    }

    return fieldResult
  }
}

module.exports = Evaluator
