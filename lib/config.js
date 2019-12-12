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
    allowedValues.find(value)
  }

  static get (key) {
    return _.get(Config.config, key)
  }

  static has (key) {
    return _.get(Config.config, key) !== undefined
  }
}

module.exports = Config
