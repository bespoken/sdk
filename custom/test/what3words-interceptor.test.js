/* eslint-env jest */
const Interceptor = require('../src/what3words-interceptor')
const Result = require('../../src/job').Result

describe('what3words test', () => {
  beforeAll(() => {
    require('../../src/config').loadFromJSON({ sourceBucket: 'what3words-samples' })
  })

  test('resolves address from parrot encoding', () => {
    const interceptor = new Interceptor()
    const alexaResponse = 'navigate|secondWord|dabble|dabble|ALEXA|thirdWord|improving|improving|ALEXA|firstWord|launched|launched|ALEXA'
    const address = interceptor._cardTextToAddress(alexaResponse)
    expect(address).toEqual('launched.dabble.improving')
  })

  test('correctly downloads and concatenates audio', async () => {
    const interceptor = new Interceptor()
    const record = {
      meta: {
        Key: '[John Kelvie] [male] [launched.dabble.improving] [20-12-2019 10-23-04].wav'
      }
    }

    await interceptor.interceptRecord(record)
    expect(record.utterance).toEqual('sample.raw')
  })

  test('correctly handles result that is corrected by autosuggest', async () => {
    const interceptor = new Interceptor()
    const alexaResponse = 'navigate|secondWord|double|double|ALEXA|thirdWord|improving|improving|ALEXA|firstWord|launched|launched|ALEXA'
    const record = {
      meta: {
        Key: '[John Kelvie] [male] [launched.dabble.improving] [20-12-2019 10-23-04].wav'
      }
    }

    const result = new Result({},
      undefined,
      {
        card: {
          textField: alexaResponse
        }
      }
    )

    await interceptor.interceptResult(record, result)
    expect(result.success).toEqual(true)
  })
})
