const _ = require('lodash')
const AWS = require('aws-sdk')
const fs = require('fs')
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
   * @param {Config} file
   */
  static loadFromFile (file) {
    const configString = fs.readFileSync(file)
    Config.loadFromJSON(JSON.parse(configString))
  }

  /**
   * Loads a new config object from JSON - this function is mainly for testability
   * This only needs to be called once - it should be done as soon as the process starts
   * @param {Config} json
   */
  static loadFromJSON (json) {
    if (Config.config) {
      return
    }
    require('dotenv').config()

    // Do core AWS stuff
    AWS.config.update({ region: 'us-east-1' })

    Config.config = json

    // Check for required values
    Config.get('customer', undefined, true)
    Config.get('job', undefined, true)
    return Config.config
  }

  static loaded () {
    return Config.config !== undefined
  }

  /**
   * Returns the value for the specified environment variable
   * Also checks to see if it is one of the allowed values if provided, and throws an error if not
   * @param {string} key The environment variable requested
   * @param {string} [allowedValues] The allowed values for the variable
   * @returns The value for the specified environment variable
   */
  static env (key, allowedValues) {
    if (!process.env[key]) {
      console.error(`Required environment variable ${key} not found. Must be set.`)
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
   * @param {string} [allowedValues]
   * @param {boolean} [required=false]
   * @returns {Object} The value for the specified key
   */
  static get (key, allowedValues, required = false, defaultValue) {
    let value = _.get(Config.config, key)
    if (value && allowedValues && allowedValues.length > 0) {
      Config._checkValues(key, value, allowedValues)
    }

    if (required && !value && !defaultValue) {
      console.error(`CONFIG FATAL ERROR: ${key} is required in configuration but is not set. Exiting.`)
      process.exit(1)
    }

    if (value === undefined && defaultValue) {
      value = defaultValue
    }
    return value
  }

  static has (key) {
    return _.get(Config.config, key) !== undefined
  }

  static boolean (key, defaultValue = false) {
    return Config.get(key, undefined, false, defaultValue)
  }

  static instance (key, defaultClass, values) {
    const singleton = Config.singleton(key)
    if (singleton) {
      return singleton
    }

    let className = Config.get(key, values, false)
    if (!className) {
      console.log(`CONFIG INSTANCE No ${key} provider specified - using default.`)
      // We can also pass an actual class, instaed of a class name
      if (typeof defaultClass !== 'string') {
        const instance = new defaultClass() // eslint-disable-line
        Config.singleton(key, instance)
        return instance
      }
      className = defaultClass
    }

    try {
      // Unable to replicate the issue with unit tests, but this fixes errors seen by external callers
      if (!path.isAbsolute(className) && !className.startsWith('.')) {
        className = './' + className
      }

      const paths = [process.cwd(), __dirname]
      console.log(`CONFIG INSTANCE loading class: ${className} using paths: ${paths} for service: ${key}`)
      const modulePath = require.resolve(className, {
        paths: paths
      })

      const Class = require(modulePath)
      const instance = new Class()
      Config.singleton(key, instance)
      return instance
    } catch (e) {
      console.error(`Could not resolve ${className} for ${key}. Exiting.`)
      console.error(`FullError: ${e}`)
      console.error(`${e.stack}`)
      throw e
    }
  }

  /**
   * Mostly for testing - resets the state of the configuration
   */
  static reset () {
    Config.config = undefined
    Config.singletons = undefined
  }

  static set (key, value) {
    Config.config[key] = value
  }

  static singleton (key, instance) {
    if (!Config.singletons) {
      Config.singletons = {}
    }

    if (!instance) {
      return Config.singletons[key]
    }
    Config.singletons[key] = instance
  }

  static _checkValues (key, value, allowedValues) {
    if (allowedValues.indexOf(value) === -1) {
      console.error(`Value [${value}] for ${key} is invalid - must be one of: ${allowedValues}`)
      process.exit(0)
    }
  }
}

module.exports = Config
