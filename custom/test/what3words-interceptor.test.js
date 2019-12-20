/* eslint-env jest */
const Interceptor = require('../src/what3words-interceptor')

describe('what3words test', () => {
  test('resolves address from parrot encoding', () => {
    const interceptor = new Interceptor()
    const alexaResponse = 'navigate|secondWord|dabble|dabble|ALEXA|thirdWord|improving|improving|ALEXA|firstWord|launched|launched|ALEXA'
    const address = interceptor._cardTextToAddress(alexaResponse)
    expect(address).toEqual('launched.dabble.improving')
  })

  test.only('correctly handles result that is correct by autosuggest', async () => {
    const interceptor = new Interceptor()
    const alexaResponse = 'navigate|secondWord|double|double|ALEXA|thirdWord|improving|improving|ALEXA|firstWord|launched|launched|ALEXA'
    const record = {
      meta: {
        Key: '[John Kelvie] [male] [launched.dabble.improving] [20-12-2019 10-23-04].wav'
      }
    }

    const result = {
      evaluation: {},
      response: {
        card: {
          textField: alexaResponse
        }
      }
    }

    await interceptor.interceptResult(record, result)
    expect(result.evaluation.success).toEqual(true)
  })
})
