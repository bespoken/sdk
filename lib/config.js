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

  static get (key) {
    Config.load()
    return _.get(Config.config, key)
  }

  static has (key) {
    Config.load()
    return _.get(Config.config, key) !== undefined
  }
}

module.exports = Config
