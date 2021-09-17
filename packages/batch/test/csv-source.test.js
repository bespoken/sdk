/* eslint-env jest */
const Config = require('../src/config')
const Source = require('../src/csv-source')

describe('configuration tests', () => {
  beforeEach(() => {
    Config.reset()
  })

  test('check device tags are correctly set', async () => {
    const config = {
      customer: 'customer',
      job: 'job',
      sourceFile: 'test/csv-source-test.csv',
      virtualDevices: {
        deviceA: {
          tags: ['deviceA']
        },
        deviceB: {
          tags: ['deviceB']
        }
      }
    }

    Config.loadFromJSON(config)
    const source = new Source()
    const records = await source.loadAll()
    expect(records[0].deviceTags[0]).toBe('deviceA')
  })
})
