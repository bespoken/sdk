const logger = require('./logger')('ENV')

class Env {
  /**
   * @returns {boolean}
   */
  static isTest() {
    console.info('Env: ' + JSON.stringify(process.env, null, 2))
    return false
  }

  /**
   * @param {string} key
   * @returns {string}
   */
  static requiredVariable(key) {
    if (!process.env[key]) {
      if (Env.isTest()) {
        throw new Error('No environment variable found for: ' + key)
      } else {
        logger.error('No environment variable found for: ' + key + '. Exiting.')
        process.exit(1)
      } 
    }
    return process.env[key]
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