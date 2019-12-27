
/* eslint-env jest */

const BatchRunner = require('../src/batch-runner')
const MockDevicePool = require('./mock-device')

describe('batch runner processes records', () => {
  test('process simple file', async () => {
    const config = {
      job: 'unit-test',
      source: 'csv-source',
      inputFile: 'test/test.csv'
    }
    require('../src/config').singleton('device-pool', new MockDevicePool())
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
})
