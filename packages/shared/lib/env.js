const logger = require('./logger')('ENV')

/**
 *
 */
class Env {
  /**
   * @returns {boolean}
   */
  static isTest() {
    if (process.env.AVA_PATH) {
      return true
    } else {
      return false
    }
  }

  /**
   * @param {string} key
   * @param {string} [defaultValue]
   * @returns {string}
   */
  static requiredVariable(key, defaultValue) {
    const value = process.env[key]
    if (value) {
      return value
    }

    if (defaultValue) {
      return defaultValue
    }

    if (Env.isTest()) {
      throw new Error('No environment variable found for: ' + key)
    } else {
      logger.error('No environment variable found for: ' + key + '. Exiting.')
      process.exit(1)
    } 
  }
  
  /**
   * @param {string} key
   * @returns {string | undefined}
   */
  static variable(key) {
    return process.env[key]
  }

  /**
   * @param {string} key
   * @param {string} valueToSearchFor
   * @returns {boolean}
   */
  static variableIncludes (key, valueToSearchFor) {
    return Env.requiredVariable(key).includes(valueToSearchFor)
  }
    
}

module.exports = Env