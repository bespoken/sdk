/* eslint-env jest */
const Config = require('../src/config')

describe('configuration tests', () => {
  beforeEach(() => {
    Config.reset()
  })

  test('module loader with unprefixed relative path (no ./)', () => {
    const config = {
      customer: 'customer',
      job: 'job',
      store: 'file-store'
    }

    Config.loadFromJSON(config)
    const store = require('../src/store').instance()
    expect(store).toBeDefined()
  })

  test('module loader with default service and unprefixed relative path (no ./)', () => {
    const config = {
      customer: 'customer',
      job: 'job',
      store: 'file-store'
    }

    Config.loadFromJSON(config)
    const printer = require('../src/printer').instance()
    expect(printer).toBeDefined()
  })
})
