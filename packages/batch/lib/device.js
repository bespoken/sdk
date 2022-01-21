const _ = require('lodash')
const Config = require('@bespoken-sdk/shared/lib/config')
const Interceptor = require('./interceptor')
const logger = require('@bespoken-sdk/shared/lib/logger')('DEVICE')
const Record = require('./record')
const util = require('./util')
const vdk = require('virtual-device-sdk')

/**
 *
 */
class Device {
  /**
   * @param {string} token
   * @param {boolean} skipSTT
   * @param {Object<string, string>} settings
   * @param {any} configuration
   */
  constructor (token, skipSTT = false, settings, configuration) {
    this._token = token
    this._skipSTT = skipSTT
    this._settings = settings
    this._tags = []
    this._configuration = configuration
  }

  /**
   * @param {Record} record
   * @param {string[]} messages
   * @param {number} [attempt=1]
   * @returns {Promise<any[]>}
   */
  async message (record, messages, attempt = 1) {
    logger.info('MESSAGE ' + messages.toString() + ' locale: ' + record.locale + ' voice: ' + record.voiceID)
    const voiceID = record.voiceID || Config.get('virtualDeviceConfig.voiceID', false, 'en-US-Wavenet-D')
    const locale = record.locale || Config.get('virtualDeviceConfig.locale', false, 'en-US')
    let config = {
      asyncMode: true,
      debug: true,
      locale: locale,
      skipSTT: this._skipSTT,
      token: this._token,
      voiceID: voiceID 
    }

    if (this._configuration) { config = _.assign(config, this._configuration) }

    const virtualDevice = new vdk.VirtualDevice(config)

    virtualDevice.baseURL = Config.get('virtualDeviceBaseURL', false, 'https://virtual-device.bespoken.io')

    try {
      const messagesArray = []
      messages.forEach(message => {
        const messageObject = {}
        const isRawFile = config.platform !== 'phone' && message.endsWith('.raw')
        if (config.platform !== 'phone' && message.startsWith('http')) {
          messageObject.audio = {
            audioURL: message,
            channels: 1,
            frameRate: 16000
          }
        } else if (isRawFile || message.startsWith('./')) {
          messageObject.audio = {
            audioPath: message,
            channels: 1,
            frameRate: 16000
          }
        } else {
          messageObject.text = message
        }

        if (this.settings) {
          messageObject.settings = this.settings
        }

        if (record.settings) {
          if (!messageObject.settings) {
            messageObject.settings = {}
          }
          Object.assign(messageObject.settings, record.settings)
        }
        messagesArray.push(messageObject)
      })

      logger.debug('MESSAGE request: ' + JSON.stringify(messagesArray))
      await Interceptor.instance().interceptRequest(record, messagesArray, this)
      const response = await virtualDevice.batchMessage(messagesArray)
      logger.debug('MESSAGE initial response: ' + JSON.stringify(response))
      if (response.conversation_id) {
        let result = { status: 'IN_PROGRESS' }
        const waitTimeInterval = _.get(this._configuration, 'waitTimeInterval') || 1000
        const maxWaitTime = _.get(this._configuration, 'maxWaitTime') || 300000
        let totalTimeWaited = 0

        record.conversationId = response.conversation_id
        // Wait 10 seconds to start
        await util.sleep(waitTimeInterval)

        while (result.status === 'IN_PROGRESS' && totalTimeWaited < maxWaitTime) {
          try {
            result = await virtualDevice.getConversationResults(response.conversation_id)
            logger.debug('message result: ' + JSON.stringify(result, null, 2))
            totalTimeWaited += waitTimeInterval
          } catch (e) {
            const error = this._parseError(e)
            logger.error(`ERROR GET CONVERSATION ID: ${response.conversation_id} error property: ${error}`)
            // If this is an error from the virtual device, do a retry
            if (error.error) {
              return this._retry(error, messages, record, attempt)
            }
          }
          await util.sleep(waitTimeInterval)
        }

        if (result.status === 'IN_PROGRESS') {
          // Server timed out, try again up the max attempts
          const errorMessage = `DEVICE ERROR maxWaitTime exceed: ${maxWaitTime} conversation id: ${response.conversation_id}`
          logger.error(errorMessage)
          return this._retry(errorMessage, messages, record, attempt)
        }

        logger.debug('DEVICE MESSAGE final transcript: ' + _.get(_.nth(_.get(result, 'results'), -1), 'transcript'))
        return result.results
      } else {
        return response.results
      }
    } catch (e) {
      return this._retry(this._parseError(e), messages, record, attempt)
    }
  }

  /**
   * @param {string} tag
   * @returns {void}
   */ 
  addTag (tag) {
    this._tags.push(tag)
  }
  
  /**
   * @param {string[]} tags
   * @returns {boolean}
   */
  hasTags (tags) {
    let success = true
    tags.forEach((tag) => {
      if (this._tags.indexOf(tag) === -1) {
        success = false
      }
    })
    return success
  }
  
  /**
   * Returns the name of the platform this device corresponds to
   * @type {string}
   */
  get platform () {
    let platform = 'other'
    if (this._token.startsWith('alexa')) {
      platform = 'amazon-alexa'
    } else if (this._token.startsWith('google')) {
      platform = 'google-assistant'
    } else if (this._token.startsWith('phone')) {
      platform = 'phone'
    }
    return platform
  }
  
  /**
   * @returns {Object<string, any>}
   */
  get settings () {
    return this._settings
  }
  
  /**
   * @type {string[]}
   */
  get tags () {
    return this._tags
  }

  /**
   * @type {string}
   */
  get token () {
    return this._token
  }

  /**
   * @private
   * @param {any} error
   * @param {string[]} messages
   * @param {Record} record
   * @param {number} attempt
   * @returns {Promise<any[]>}
   */
  async _retry (error, messages, record, attempt) {
    const errorMessage = error.error ? error.error : error.toString()
    if (attempt > Config.get('maxAttempts', true, 3)) {
      // Give up after three tries
      throw errorMessage
    }

    const backoffTime = Config.get('backoffTime', false, 10)
    logger.error(`DEVICE MESSAGE error: ${errorMessage} retrying ${backoffTime} seconds`)
    await util.sleep(backoffTime * 1000)
    return this.message(record, messages, attempt + 1)
  }

  /**
   * @private
   * @param {any} error
   * @returns {any}
   */
  _parseError (error) {
    if (_.isObject(error)) {
      return error
    } else {
      try {
        return JSON.parse(error)
      } catch (e) {
        return e
      }
    }
  }
}

/**
 *
 */
class DevicePool {
  /**
   * @returns {DevicePool}
   */
  static instance () {
    return Config.instance('device-pool', DevicePool)
  }

  /**
   *
   */
  constructor () {
    this._devices = []
    this.initialize()
  }

  /**
   * @returns {void}
   */
  initialize () {
    const tokensInfo = Config.get('virtualDevices', true)
    const virtualDeviceConfig = Config.get('virtualDeviceConfig', false)
    const tokens = Object.keys(tokensInfo)
    const maxTokens = process.env.VIRTUAL_DEVICE_LIMIT ? parseInt(process.env.VIRTUAL_DEVICE_LIMIT) : tokens.length
    this._devices = []

    let skipSTT = false
    if (Config.has('transcript')) {
      skipSTT = Config.get('transcript') === false
    }
    // Create a device for each token
    tokens.slice(0, maxTokens).forEach(token => {
      const tokenInfo = tokensInfo[token]
      let tags
      if (Array.isArray(tokenInfo)) {
        tags = tokenInfo
      } else {
        tags = tokenInfo.tags ? tokenInfo.tags : []
      }

      // Clean the tags - trim them
      tags = tags.map(tag => tag.trim())
      logger.info(`CREATE token: ${token} skipSTT: ${skipSTT} tags: ${tags} settings: ${JSON.stringify(tokenInfo.settings)}`)
      const device = new Device(token.trim(), skipSTT, tokenInfo.settings, virtualDeviceConfig)

      // Add the tags to the device
      tags.forEach(tag => device.addTag(tag))
      this._devices.push(device)
    })

    // Create an array to track the devices currently in use
    this._devicesInUse = []
  }

  /**
   * @param {Record} record
   * @returns {Promise<Device>}
   */
  async lock (record) {
    // Check if there are any devices at all
    if (this._validDevices(record).length === 0) {
      logger.error(`LOCK no device exists to process tags: ${record.deviceTags}`)
      process.exit(1)
    }

    logger.debug(`LOCK tags: ${record.deviceTags} count: ${this._freeDevices(record).length}`)
    while (this._freeDevices(record).length === 0) {
      await util.sleep(1000)
    }

    // If there is a free token, add to our list of tokens in use so no one else can use it
    const device = this._freeDevices(record).find((device) => {
      return this._devicesInUse.find(d => d.token === device.token) === undefined
    })

    if (!device) {
      throw new Error('No device available for locking')
    }

    this._devicesInUse.push(device)
    logger.debug(`LOCK acquire tags: ${record.deviceTags} available: ${this._freeDevices(record).length} token: ${device.token}`)

    return device
  }

  /**
   * @param {Device} device
   * @returns {Promise<void>}
   */
  async free (device) {
    // Remove the token we used from our tokens in list use - i.e., return it to the free pool
    this._devicesInUse = _.pull(this._devicesInUse, device)
    logger.debug('FREE ' + device._token + ' tokens available: ' + this._freeCount())
  }

  /**
   * @private
   * @param {Record} record
   * @returns {Device[]}
   */
  _freeDevices (record) {
    const validDevices = this._validDevices(record)

    // Then filter down to those that are available
    const freeDevices = validDevices.filter(device => {
      return !this._devicesInUse.find(d => d.token === device.token)
    })
    return freeDevices
  }

  /**
   * @private
   * @returns {number}
   */
  _freeCount () {
    return this._devices.length - this._devicesInUse.length
  }

  // Filter to the devices that have tags that match the record
  /**
   * @private
   * @param {Record} record
   * @returns {Device[]}
   */
  _validDevices (record) {
    if (!this._devices) {
      throw new Error('There are no valid devices')
    }

    const validDevices = this._devices.filter(device => {
      return device.hasTags(record.deviceTags)
    })
    return validDevices
  }
}

module.exports = {
  Device,
  DevicePool
}
