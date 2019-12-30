
/* eslint-env jest */

const BatchRunner = require('../src/batch-runner')
const Config = require('../src/config')
const MockDevicePool = require('./mock-device')
const Record = require('../src/source').Record
const Source = require('../src/source').Source

describe('batch runner processes records', () => {
  beforeEach(() => {
    Config.reset()
  })

  test('process simple file', async () => {
    const config = {
      job: 'unit-test',
      source: 'csv-source',
      store: 'file-store',
      sourceFile: 'test/test.csv'
    }
    Config.singleton('device-pool', new MockDevicePool())
    const runner = new BatchRunner(config)
    try {
      await runner.process()
    } catch (e) {
      console.error(e)
      throw e
    }
    expect(runner.job.results.length).toEqual(1)

    const firstResult = runner.job.results[0]
    expect(firstResult.actualFields.transcript).toEqual('my utterance')
    expect(firstResult.record.expectedFields.transcript).toEqual('my utterance')
    expect(firstResult.record.utterance).toEqual('my utterance')
  })

  test('filter applied to records', async () => {
    const config = {
      filters: {
        index: [1, 2],
        booleanProperty: true
      },
      job: 'unit-test',
      sourceFile: 'test/test.csv',
      store: 'file-store'
    }
    Config.singleton('device-pool', new MockDevicePool())
    Config.singleton('source', new MockSource())

    const runner = new BatchRunner(config)
    try {
      await runner.process()
    } catch (e) {
      console.error(e)
      throw e
    }
    expect(runner.job.results.length).toEqual(1)

    const firstResult = runner.job.results[0]
    expect(firstResult.record.utterance).toEqual('Utterance1')
  })
})

class MockSource extends Source {
  async loadAll () {
    return Promise.resolve([this._makeRecord(0), this._makeRecord(1), this._makeRecord(2, false)])
  }

  _makeRecord (index, booleanProperty = true) {
    const record = new Record('Utterance' + index)
    record.meta = {
      index: index,
      booleanProperty: booleanProperty
    }
    return record
  }
}
