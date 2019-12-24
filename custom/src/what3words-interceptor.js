const axios = require('axios')
const Config = require('../../src/config')
const fs = require('fs')
const Interceptor = require('../../src/interceptor')
const S3Source = require('../../src/s3-source')
const w3w = require('@what3words/api')

class What3WordsInterceptor extends Interceptor {
  static initialize () {
    var options = {
      key: Config.env('WHAT3WORDS_API_KEY'),
      lang: 'en',
      display: 'terse'
    }

    w3w.setOptions(options)
  }

  async interceptRecord (record) {
    // Get the S3 url for this file
    const url = S3Source.urlForKey('what3words-samples', record.meta.Key)

    // Get the file data from S3
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    // console.log('Response: ' + JSON.stringify(response.data, null, 2))

    const mainAudio = response.data.slice(44)
    const introAudio = fs.readFileSync('custom/input/NavigateTo.wav').slice(44)

    // Concatenate the files
    const combinedAudio = Buffer.concat([introAudio, mainAudio])
    fs.writeFileSync('sample.raw', combinedAudio)
    record.utterance = 'sample.raw'
    return true
  }

  async interceptResult (record, result) {
    const key = record.meta.Key
    const metaData = this._metaFromKey(key)
    const addressInfo = await w3w.convertToCoordinates(metaData.address)
    const encodedAlexaRequest = result.lastResponse.card.textField

    // We get back the raw request Alexa sent to the skill - parse it into an address
    const recognizedAddress = this._cardTextToAddress(encodedAlexaRequest)
    console.log(`WHAT3WORDS Recognized: ${recognizedAddress} Expected: ${metaData.address}`)
    let success = false
    let suggestedAddress
    if (!recognizedAddress) {
      console.log(`WHAT3WORDS Expected: ${metaData.address} Raw: ${result.lastResponse.card.textField}`)
    } else if (metaData.address === recognizedAddress) {
      success = true
    } else {
      // Adjust our location
      const newLat = parseFloat(addressInfo.coordinates.lat) - 0.1

      // Now lookup the suggested address for this location
      // We use the clip to keep the recommendation within 15K of the user
      try {
        const suggestedAddressResponse = await w3w.autosuggest(recognizedAddress, {
          clipToCircle: {
            center: {
              lat: newLat,
              lng: addressInfo.coordinates.lng
            },
            radius: 15
          }
        })

        console.log('WHAT3WORDS Suggested Payload: ' + JSON.stringify(suggestedAddressResponse, null, 2))
        if (suggestedAddressResponse.suggestions && suggestedAddressResponse.suggestions.length > 0) {
          suggestedAddress = suggestedAddressResponse.suggestions[0].words
          console.log(`WHAT3WORDS Suggested: ${suggestedAddress} Expected: ${metaData.address}`)
          if (suggestedAddress === metaData.address) {
            success = true
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    // Set all the stuff we need on the records
    record.utterance = record.meta.Key
    result.expectedAddress = metaData.address
    result.recognizedAddress = recognizedAddress
    result.suggestedAddress = suggestedAddress
    result.evaluation.success = success
    result.raw = result.lastResponse.card.textField

    // Add in custom tags
    result.tags = [
      `address:${metaData.address}`,
      `gender:${metaData.gender}`,
      `speaker:${metaData.speaker}`
    ]
  }

  _cardTextToAddress (encodedAlexaRequest) {
    // Parse the feedback from the parrot skill - pipe values that represent:
    // Intent|[SlotName|Value|ID|Resolver]
    const alexaParts = encodedAlexaRequest.split('|')
    const intentName = alexaParts[0]
    if (intentName !== 'navigate') {
      return undefined
    }

    const parts = {}
    for (let i = 1; i < alexaParts.length; i += 4) {
      const slotName = alexaParts[i]
      const value = alexaParts[i + 1]
      parts[slotName] = value
    }

    return `${parts.firstWord}.${parts.secondWord}.${parts.thirdWord}`
  }

  _metaFromKey (key) {
    const metaData = key.match(/\[(.*)\] \[(.*)\] \[(.*)\] \[.*\].wav/).slice(1)
    if (metaData.length === 3) {
      return {
        address: metaData[2],
        gender: metaData[1],
        speaker: metaData[0]
      }
    }
  }
}

What3WordsInterceptor.initialize()

module.exports = What3WordsInterceptor
