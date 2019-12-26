
/* eslint-env jest */

const BatchRunner = require('../src/batch-runner')

describe('batch runner processes records', () => {
  test('process simple file', async () => {
    const config = {
      device: '../test/mock-device',
      job: 'unit-test',
      source: 'csv-source',
      inputFile: 'test/test.csv'
    }
    const runner = new BatchRunner(config)
    await runner.process()
    expect(runner.job.results.length).toEqual(1)

    const firstResult = runner.job.results[0]
    expect(firstResult.actualFields.transcript).toEqual('my utterance')
    expect(firstResult.record.expectedFields.transcript).toEqual('my utterance')
    expect(firstResult.record.utterance).toEqual('my utterance')
  })
})
