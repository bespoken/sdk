const DevicePool = require('../src/device').DevicePool

module.exports = class MockDevicePool extends DevicePool {
  initialize () {

  }

  async free () {
    return Promise.resolve()
  }

  async lock () {
    return Promise.resolve(MockDevice)
  }
}

const MockDevice = {
  message: async (voiceId, messages) => {
    console.log('Got messages: ' + messages)
    const responses = messages.map(m => {
      return { message: m, transcript: m }
    })
    return Promise.resolve(responses)
  }
}
