const _ = require('lodash')
const fs = require('fs')
const logger = require('./logger')('CONFIG')
const path = require('path')

require('dotenv').config()

/**
 * <pre>
 * Manages configuration for the batch-runner
 * Provides programmatic access to the configuration file used for the particular test
 * Additionally:
 *  * Provides convenience access to environment variables
 *  * Manages and provides access to singletons
 * </pre>
 */
class Config {
  /**
   * <pre>
   * Loads a new config object from a file
   * This only needs to be called once - it should be done as soon as the process starts
   * </pre>
   * @param {string} file
   * @returns {void}
   */
  static loadFromFile (file) {
    const configString = fs.readFileSync(file, 'utf-8')
    Config.loadFromJSON(JSON.parse(configString))
  }

  /**
   * Loads a new config object from JSON - this function is mainly for testability
   * This only needs to be called once - it should be done as soon as the process starts
   * @param {any} json
   * @returns {Config}
   */
  static loadFromJSON (json) {
    if (Config.config) {
      return
    }
    require('dotenv').config()

    Config.config = json

    // Check for required values
    Config.get('customer', true)
    Config.get('job', true)
    return Config.config
  }

  /**
   * @returns {boolean}
   */
  static loaded () {
    return Config.config !== undefined
  }

  /**
   * Returns the value for the specified environment variable
   * Also checks to see if it is one of the allowed values if provided, and throws an error if not
   * @param {string} key The environment variable requested
   * @param {string[]} [allowedValues] The allowed values for the variable
   * @returns {string} The value for the specified environment variable
   */
  static env (key, allowedValues) {
    if (!process.env[key]) {
      logger.error(`Required environment variable ${key} not found. Must be set.`)
      process.exit(1)
    }

    const value = process.env[key]
    if (allowedValues && allowedValues.length > 0) {
      Config._checkValues(key, value, allowedValues)
    }
    return value
  }

  /**
   * Gets a particulate key value from the configuration file. Dot-notation is allowed.
   * Checks the values against the allowed values, if provided
   * @param {string} key
   * @param {boolean} [required=false]
   * @param {any} [defaultValue]
   * @param {string[]} [allowedValues]
   * @returns {Object} The value for the specified key
   */
  static get (key, required = false, defaultValue = undefined, allowedValues) {
    let value = _.get(Config.config, key)
    if (value && allowedValues && allowedValues.length > 0) {
      Config._checkValues(key, value, allowedValues)
    }

    if (required && !value && !defaultValue) {
      logger.error(`CONFIG FATAL ERROR: ${key} is required in configuration but is not set. Exiting.`)
      process.exit(1)
    }

    if (value === undefined && defaultValue) {
      value = defaultValue
    }
    return value
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  static has (key) {
    return _.get(Config.config, key) !== undefined
  }

  /**
   * @param {string} key
   * @param {boolean} [defaultValue=false]
   * @returns {boolean}
   */
  static boolean (key, defaultValue = false) {
    return Config.get(key, false, defaultValue)
  }

  /**
   * @param {string} key
   * @returns {number}
   */
  static int (key) {
    return parseInt(Config.get(key))
  }

  /**
   * @param {string} key
   * @param {any} [defaultClass]
   * @param {...any} [classParams]
   * @returns {any}
   */
  static instance (key, defaultClass, ...classParams) {
    const singleton = Config.singleton(key)
    if (singleton) {
      return singleton
    }

    let className = Config.get(key, false, undefined)
    if (!className) {
      logger.debug(`CONFIG INSTANCE No ${key} provider specified - using default.`)
      if (!defaultClass) {
        return undefined
      }
      // We can also pass an actual class, instaed of a class name
      if (typeof defaultClass !== 'string') {
        const instance = new defaultClass(...classParams) // eslint-disable-line
        Config.singleton(key, instance)
        return instance
      }
      className = defaultClass
    }

    try {
      // Unable to replicate the issue with unit tests, but this fixes errors seen by external callers
      if (!path.isAbsolute(className) && !className.startsWith('.') && !className.startsWith('@')) {
        className = './' + className
      }

      const paths = [process.cwd(), __dirname]
      logger.debug(`CONFIG INSTANCE loading class: ${className} using paths: ${paths} for service: ${key}`)
      const modulePath = require.resolve(className, {
        paths: paths
      })

      const Class = require(modulePath)
      const instance = new Class(...classParams)
      Config.singleton(key, instance)
      return instance
    } catch (e) {
      logger.error(`Could not resolve ${className} for ${key}. Exiting.`)
      logger.error(`FullError: ${e}`)
      logger.error(`${e.stack}`)
      throw e
    }
  }

  /**
   * Mostly for testing - resets the state of the configuration
   * @returns {void}
   */
  static reset () {
    Config.config = undefined
    Config.singletons = undefined
  }

  /**
   * @param {string} key
   * @param {string} value
   * @returns {void}
   */
  static set (key, value) {
    Config.config[key] = value
  }

  /**
   * @param {string} key
   * @param {any} instance
   * @returns {any}
   */
  static singleton (key, instance) {
    if (!Config.singletons) {
      Config.singletons = {}
    }

    if (!instance) {
      return Config.singletons[key]
    }
    Config.singletons[key] = instance
  }

  /**
   * @param {string} key
   * @param {string} value
   * @param {string[]} allowedValues
   * @returns {void}
   */
  static _checkValues (key, value, allowedValues) {
    if (allowedValues.indexOf(value) === -1) {
      logger.error(`Value [${value}] for ${key} is invalid - must be one of: ${allowedValues}`)
      process.exit(0)
    }
  }
}

Config.config = undefined
Config.singletons = undefined
module.exports = Config
