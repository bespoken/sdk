const fs = require('fs')
const vdk = require('virtual-device-sdk')

const config = JSON.parse(fs.readFileSync('testing.json'))

const Device = {
  message: async (token, message, attempt = 1) => {
    const device = new vdk.VirtualDevice({
      debug: true,
      token: config.virtualDeviceToken,
      voiceID: 'en-US-Wavenet-D'
    })
    device.baseURL = config.virtualDeviceBaseURL

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

  pause: async (sleepTime) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, sleepTime)
    })
  }
}

module.exports = Device
