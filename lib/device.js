const fs = require('fs')
const vdk = require('virtual-device-sdk')

const Device = {
  message: async (token, message, attempt = 1) => {
    const device = new vdk.VirtualDevice({
      debug: true,
      token: process.env.VIRTUAL_DEVICE_TOKEN,
      voiceID: 'en-US-Wavenet-D'
    })

    device.baseURL = process.env.VIRTUAL_DEVICE_BASE_URL ? process.env.VIRTUAL_DEVICE_BASE_URL : 'https://virtual-device.bespoken.io'

    try {
      return await device.message(message)
    } catch (e) {
      let error = e
      try {
        // Try to parse out the error message, if this is JSON
        error = JSON.parse(e).error
      } catch (ee) {}

      if (attempt > 3) {
        // Give up after three tries
        return error
      }

      const backoffTime = 10000
      console.error(`ERROR: ${error} RETRYING IN ${backoffTime / 1000} seconds`)
      await Device.pause(backoffTime)
      return Device.message(token, message, attempt + 1)
    }
  },

  pause: async sleepTime => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, sleepTime)
    })
  }
}

module.exports = Device
