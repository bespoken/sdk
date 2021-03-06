/* eslint-env jest */

const BatchRunner = require('../src/batch-runner')
const Config = require('../src/config')
const MockDevicePool = require('./mock-device')
const Record = require('../src/source').Record
const Source = require('../src/source').Source
const Interceptor = require('../src/interceptor')
const EmailNotifier = require('../src/email-notifier')

describe('batch runner processes records', () => {
  let config

  beforeEach(() => {
    Config.reset()
    config = {
      customer: 'bespoken',
      job: 'unit-test',
      source: 'csv-source',
      store: 'file-store',
      sourceFile: 'test/test.csv'
    }
    Config.singleton('device-pool', new MockDevicePool())
  })

  test('process simple file', async () => {
    const runner = await runnerProccess(config)
    expect(runner.job.results.length).toEqual(1)

    const firstResult = runner.job.results[0]
    expect(firstResult.actualFields.transcript).toEqual('my utterance')
    expect(firstResult.record.expectedFields.transcript).toEqual(
      'my utterance'
    )
    expect(firstResult.record.utterance).toEqual('my utterance')
  })

  test('filter applied to records', async () => {
    config.filters = {
      index: [1, 2, 3],
      booleanProperty: true
    }
    Config.singleton('source', new MockSource())
    const runner = await runnerProccess(config)
    expect(runner.job.results.length).toEqual(2)
    const firstResult = runner.job.results[0]
    expect(firstResult.record.utterance).toEqual('Utterance1')
  })

  describe('configuration fields', () => {
    test('field has invalid json path', async () => {
      config.sourceFile = 'test/fields-test.csv'
      config.fields = { provider: '$.invalid json path' }
      const runner = await runnerProccess(config)
      const firstResult = runner.job.results[0]
      expect(firstResult.success).toBeFalsy()
    })

    test('field result is not the expected field', async () => {
      config.sourceFile = 'test/fields-test.csv'
      config.fields = { provider: '$.otherProvider' }
      const runner = await runnerProccess(config)
      expect(runner.job.results.length).toEqual(1)
      const firstResult = runner.job.results[0]
      expect(firstResult.success).toBeFalsy()
    })

    test('field is an output field', async () => {
      config.sourceFile = 'test/fields-test.csv'
      config.fields = {
        provider: '$.otherProvider',
        unexpected: '$.unexpected'
      }
      const runner = await runnerProccess(config)
      const firstResult = runner.job.results[0]
      expect(firstResult.record.expectedFields).toHaveProperty('provider')
      expect(firstResult.record.expectedFields).not.toHaveProperty('unexpected')
    })

    describe('handle multiple matches', () => {
      test('field result includes expected value', async () => {
        config.sourceFile = 'test/multiple-matches-test.csv'
        config.fields = { multiple: '$.multiple[*].name' }
        const runner = await runnerProccess(config)
        expect(runner.job.results[0].success).toBeTruthy()
      })

      test('field result does not include expected value', async () => {
        config.sourceFile = 'test/failed-multiple-matches-test.csv'
        config.fields = { multiple: '$.multiple[*].name' }
        const runner = await runnerProccess(config)
        expect(runner.job.results[0].success).toBeFalsy()
      })

      test('expected field accepts everything', async () => {
        config.sourceFile = 'test/expect-anything-test.csv'
        config.fields = { provider: '$.anything' }
        const runner = await runnerProccess(config)
        expect(runner.job.results[0].success).toBeTruthy()
      })

      test('field result is one of the expected values', async () => {
        config.sourceFile = 'test/multiple-expected-matches-test.csv'
        config.fields = { multiple: '$.multiple[*].name' }
        const runner = await runnerProccess(config)
        expect(runner.job.results[0].success).toBeTruthy()
      })
    })
  })

  describe('retry results', () => {
    test('result has no retry', async () => {
      const runner = await runnerProccess(config)
      expect(runner.job.results[0].retryCount).toEqual(0)
      expect(runner.job.results[0].shouldRetry).toBeFalsy()
      expect(runner.job.results.length).toEqual(1)
    })

    test('result has retry count', async () => {
      Config.singleton('interceptor', new MockInterceptor())
      const runner = await runnerProccess(config)
      expect(runner.job.results[0].retryCount).toEqual(2)
      expect(runner.job.results[0].shouldRetry).toBeTruthy()
      expect(runner.job.results.length).toEqual(1)
    })
  })

  describe('send email', () => {
    test('email is not sent', async () => {
      const notifier = EmailNotifier.instance()
      const spy = jest.spyOn(notifier, 'send')
      await runnerProccess(config)
      expect(spy).not.toHaveBeenCalled()
    })

    test('email is sent', async () => {
      const OLD_ENV = { ...process.env }
      process.env.NOTIFICATION_EMAILS = 'support@bespoken.io,bespoken@bespoken.io'
      process.env.NOTIFICATION_ACCESS_KEY_ID = '12341234'
      process.env.NOTIFICATION_SECRET_ACCESS_KEY = '12314234'
      const notifier = EmailNotifier.instance()
      const spy = jest.spyOn(notifier, 'send')
      await runnerProccess(config)
      expect(await spy).toHaveBeenCalled()
      process.env = OLD_ENV
    })
  })
})

async function runnerProccess (config) {
  const runner = new BatchRunner(config)
  try {
    await runner.process()
  } catch (e) {
    console.error(e)
    throw e
  }
  return runner
}

class MockSource extends Source {
  async loadAll () {
    return Promise.resolve([
      this._makeRecord(0),
      this._makeRecord(1),
      this._makeRecord(2, false),
      this._makeRecord(3)
    ])
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

class MockInterceptor extends Interceptor {
  async interceptResult (_record, result) {
    result.shouldRetry = true
    return true
  }
}
