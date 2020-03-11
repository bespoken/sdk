const _ = require('lodash')
const Config = require('./config')
const util = require('./util')
const vdk = require('virtual-device-sdk')

class Device {
  constructor (token, skipSTT = false, settings) {
    this._token = token
    this._skipSTT = skipSTT
    this._settings = settings
    this._tags = []
  }

  async message (voiceId, messages, attempt = 1) {
    const virtualDevice = new vdk.VirtualDevice({
      asyncMode: true,
      debug: true,
      skipSTT: this._skipSTT,
      token: this._token,
      voiceID: voiceId
    })

    virtualDevice.baseURL = Config.get('virtualDeviceBaseURL', undefined, false, 'https://virtual-device.bespoken.io')

    console.log('BASEURL: ' + virtualDevice.baseURL)
    try {
      const messagesArray = []
      messages.forEach(message => {
        const messageObject = {}
        if (message.startsWith('http')) {
          messageObject.audio = {
            audioURL: message,
            frameRate: 16000,
            channels: 1
          }
        } else if (message.endsWith('.raw')) {
          messageObject.audio = {
            audioPath: message,
            frameRate: 16000,
            channels: 1
          }
        } else {
          messageObject.text = message
        }

        if (this.settings) {
          messageObject.settings = this.settings
        }
        messagesArray.push(messageObject)
      })

      const response = await virtualDevice.batchMessage(messagesArray)
      console.log('DEVICE MESSAGE initial response: ' + JSON.stringify(response))
      if (response.conversation_id) {
        let result = { status: 'IN_PROGRESS' }
        while (result.status === 'IN_PROGRESS') {
          try {
            result = await virtualDevice.getConversationResults(response.conversation_id)
          } catch (e) {
            console.error('DEVICE ERROR get conversation: ' + e.toString())
          }
          await util.sleep(1000)
        }
        console.log('DEVICE MESSAGE final response: ' + JSON.stringify(result))
        return result.results
      }
    } catch (e) {
      let error = e
      try {
        // Try to parse out the error message, if this is JSON
        error = JSON.parse(e).error
      } catch (ee) {}

      if (attempt > 3) {
        // Give up after three tries
        throw error
      }

      const backoffTime = 10000
      console.error(`DEVICE MESSAGE error: ${error} retrying ${backoffTime / 1000} seconds`)
      await util.sleep(backoffTime)
      return this.message(voiceId, messages, attempt + 1)
    }
  }

  addTag (tag) {
    this._tags.push(tag)
  }

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
   */
  get platform () {
    let platform = 'other'
    if (this._token.startsWith('alexa')) {
      platform = 'amazon-alexa'
    } else if (this._token.startsWith('google')) {
      platform = 'google-assistant'
    }
    return platform
  }

  get settings () {
    return this._settings
  }

  get tags () {
    return this._tags
  }

  get token () {
    return this._token
  }
}

class DevicePool {
  static instance () {
    return Config.instance('device-pool', DevicePool)
  }

  constructor () {
    this.initialize()
  }

  initialize () {
    const tokensInfo = Config.get('virtualDevices', undefined, true)
    const tokens = Object.keys(tokensInfo)
    this._devices = []

    let skipSTT = false
    if (Config.has('transcript')) {
      skipSTT = Config.get('transcript') === false
    }
    // Create a device for each token
    tokens.forEach(token => {
      const tokenInfo = tokensInfo[token]
      let tags
      if (Array.isArray(tokenInfo)) {
        tags = tokenInfo
      } else {
        tags = tokenInfo.tags
      }

      // Clean the tags - trim them
      tags = tags.map(tag => tag.trim())
      console.log(`DEVICE create token: ${token} skipSTT: ${skipSTT} tags: ${tags} settings: ${JSON.stringify(tokenInfo.settings)}`)
      const device = new Device(token.trim(), skipSTT, tokenInfo.settings)

      // Add the tags to the device
      tags.forEach(tag => device.addTag(tag))
      this._devices.push(device)
    })

    // Create an array to track the devices currently in use
    this._devicesInUse = []
  }

  async lock (record) {
    // Check if there are any devices at all
    if (this._validDevices(record).length === 0) {
      console.error(`DEVICE LOCK no device exists to process tags: ${record.deviceTags}`)
      process.exit(1)
    }

    console.log(`DEVICE LOCK tags: ${record.deviceTags} count: ${this._freeDevices(record).length}`)
    while (this._freeDevices(record).length === 0) {
      await util.sleep(1000)
    }

    // If there is a free token, add to our list of tokens in use so no one else can use it
    const device = this._freeDevices(record).find((device) => {
      return this._devicesInUse.find(d => d.token === device.token) === undefined
    })

    this._devicesInUse.push(device)
    console.log(`DEVICE LOCK acquire tags: ${record.deviceTags} available: ${this._freeDevices(record).length} token: ${device.token}`)

    return device
  }

  async free (device) {
    // Remove the token we used from our tokens in list use - i.e., return it to the free pool
    this._devicesInUse = _.pull(this._devicesInUse, device)
    console.log('DEVICE FREE ' + device._token + ' tokens available: ' + this._freeCount())
  }

  _freeDevices (record) {
    const validDevices = this._validDevices(record)

    // Then filter down to those that are available
    const freeDevices = validDevices.filter(device => {
      return !this._devicesInUse.find(d => d.token === device.token)
    })
    return freeDevices
  }

  _freeCount () {
    return this._devices.length - this._devicesInUse.length
  }

  // Filter to the devices that have tags that match the record
  _validDevices (record) {
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
