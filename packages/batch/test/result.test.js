/* eslint-env jest */
const Result = require('../src/job').Result
const Config = require('../src/config')

describe('Job result', () => {
  test('works as it should', () => {
    Config.loadFromJSON({
      job: 'test',
      customer: 'jest',
      homophones: {
        radio: ['rad10', 'r4Dio']
      }
    })

    const result = new Result({}, undefined, [{
      raw: {
        ocrJSON: {
          TextDetections: [
            {
              DetectedText: 'rad10',
              Confidence: 90,
              Type: 'LINE'
            },
            {
              DetectedText: 'playing r4Dio',
              Confidence: 95,
              Type: 'LINE'
            }
          ]
        }
      }
    }])

    expect(result.sanitizedOcrLines[0].DetectedText).toEqual('radio')
    expect(result.sanitizedOcrLines[1].DetectedText).toEqual('playing radio')
  })
})
