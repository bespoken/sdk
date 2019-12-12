const _ = require('lodash')
const fs = require('fs')

require('dotenv').config()

class Config {
  static load () {
    if (Config.config) {
      return
    }
    const configString = fs.readFileSync('config.json')
    Config.config = JSON.parse(configString)
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

  static get (key, allowedValues) {
    const value = _.get(Config.config, key)
    if (value && allowedValues) {
      Config._checkValues(key, value, allowedValues)
    }
    return value
  }

  static has (key) {
    return _.get(Config.config, key) !== undefined
  }

  static _checkValues (key, value, allowedValues) {
    if (allowedValues.indexOf(value) === -1) {
      console.error(`Value [${value}] for ${key} is invalid - must be one of: ${allowedValues}`)
      process.exit(0)
    }
  }
}

module.exports = Config
