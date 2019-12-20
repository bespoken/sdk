const _ = require('lodash')
const AWS = require('aws-sdk')
const fs = require('fs')

require('dotenv').config()

class Config {
  static loadFromFile (file) {
    const configString = fs.readFileSync(file)
    Config.loadFromJSON(JSON.parse(configString))
  }

  static loadFromJSON (json) {
    if (Config.config) {
      return
    }
    require('dotenv').config()

    // Do core AWS stuff
    AWS.config.update({ region: 'us-east-1' })

    Config.config = json
    return Config.config
  }

  static env (key, allowedValues) {
    if (!process.env[key]) {
      console.error(`Required environment variable ${key} not found. Must be set.`)
      process.exit(1)
    }

    const value = process.env[key]
    if (allowedValues) {
      Config._checkValues(key, value, allowedValues)
    }
    return value
  }

  static get (key, allowedValues, required = false) {
    const value = _.get(Config.config, key)
    if (value && allowedValues) {
      Config._checkValues(key, value, allowedValues)
    }

    if (required && !value) {
      console.log('Config: ' + Config.config[key])
      console.error(`${key} is required in configuration but is not set. Exiting.`)
      process.exit(1)
    }
    return value
  }

  static has (key) {
    return _.get(Config.config, key) !== undefined
  }

  static instance (key, values, defaultClass, required) {
    let className = Config.get(key, values, required)
    if (!className) {
      console.log(`No ${key} provider specified - using default.`)
      className = defaultClass
    }

    if (!className.startsWith('.')) {
      className = './' + className
    }

    try {
      const Class = require(className)
      return new Class()
    } catch (e) {
      console.error(`Could not resolve ${className} for ${key}. Exiting.`)
      console.error(`FullError: ${e}`)
      console.error(`${e.stack}`)
      process.exit(1)
    }
  }

  static _checkValues (key, value, allowedValues) {
    if (allowedValues.indexOf(value) === -1) {
      console.error(`Value [${value}] for ${key} is invalid - must be one of: ${allowedValues}`)
      process.exit(0)
    }
  }
}

module.exports = Config
