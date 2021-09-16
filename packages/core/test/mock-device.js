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
    console.info('Got messages: ' + messages)
    const responses = messages.map(m => {
      return { message: m, transcript: m, multiple: [{ name: 'A' }, { name: 'B' }] }
    })
    return Promise.resolve(responses)
  }
}
