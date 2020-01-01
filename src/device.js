const _ = require('lodash')
const Config = require('./config')
const util = require('./util')
const vdk = require('virtual-device-sdk')

class Device {
  constructor (token, skipSTT = false) {
    this._token = token
    this._skipSTT = skipSTT
  }

  async message (voiceId, messages, attempt = 1) {
    const virtualDevice = new vdk.VirtualDevice({
      debug: true,
      skipSTT: this._skipSTT,
      token: this._token,
      voiceID: voiceId
    })

    virtualDevice.baseURL = process.env.VIRTUAL_DEVICE_BASE_URL ? process.env.VIRTUAL_DEVICE_BASE_URL : 'https://virtual-device.bespoken.io'

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
        messagesArray.push(messageObject)
      })
      return await virtualDevice.batchMessage(messagesArray)
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
      console.error(`ERROR: ${error} RETRYING IN ${backoffTime / 1000} seconds`)
      await util.sleep(backoffTime)
      return this.message(voiceId, messages, attempt + 1)
    }
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
    const tokens = process.env.VIRTUAL_DEVICE_TOKEN.split(',') // The virtual device token(s) used for processing
    this._devices = []

    let skipSTT = false
    if (Config.has('transcript')) {
      skipSTT = Config.get('transcript') === false
    }
    // Create a device for each token
    tokens.forEach(token => {
      console.log(`DEVICE create token: ${token} skipSTT: ${skipSTT}`)
      this._devices.push(new Device(token.trim(), skipSTT))
    })

    // Create an array to track the devices currently in use
    this._devicesInUse = []
  }

  async lock () {
    // Check if a free token is available
    console.log('DEVICE LOCK attempt - devices available: ' + this._freeCount())
    while (this._freeCount() === 0) {
      await util.sleep(1000)
    }

    // If there is a free token, add to our list of tokens in use so no one else can use it
    const device = this._devices.find((device) => {
      return this._devicesInUse.find(d => d.token === device.token) === undefined
    })
    console.log('DEVICE LOCK acquire - devices available: ' + this._freeCount() + ' TOKEN: ' + device.token)

    this._devicesInUse.push(device)
    return device
  }

  async free (device) {
    // Remove the token we used from our tokens in list use - i.e., return it to the free pool
    this._devicesInUse = _.pull(this._devicesInUse, device)
    console.log('DEVICE FREE ' + device._token + ' tokens available: ' + this._freeCount())
  }

  _freeCount () {
    return this._devices.length - this._devicesInUse.length
  }
}

module.exports = {
  Device,
  DevicePool
}
