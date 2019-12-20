const _ = require('lodash')
const axios = require('axios')
const fs = require('fs')
const Interceptor = require('../../src/interceptor')
const S3Source = require('../../src/s3-source')
const w3w = require('@what3words/api')

class What3WordsInterceptor extends Interceptor {
  static initialize () {
    var options = {
      key: '5X0A8UKF',
      lang: 'en',
      display: 'terse'
    }

    w3w.setOptions(options)
  }

  async interceptRecord (record) {
    const key = record.meta.Key

    // Parse the w3w address from the file
    const address = this._w3wFromKey(key)
    console.log(`${key} is ${address} `)

    // Get the S3 url for this file
    const url = S3Source.urlForKey('what3words-samples', record.meta.Key)
    console.log(`URL: ${url}`)

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
    const address = this._w3wFromKey(key)
    const addressInfo = await w3w.convertToCoordinates(address)
    const encodedAlexaRequest = result.lastResponse.card.textField

    // We get back the raw request Alexa sent to the skill - parse it into an address
    const recognizedAddress = this._cardTextToAddress(encodedAlexaRequest)
    console.log(`Recognized address by Alexa: ${recognizedAddress}`)
    let success = false
    if (address === recognizedAddress) {
      success = true
    } else {
      // Adjust our location
      const newLat = parseFloat(addressInfo.coordinates.lat) - 0.1
      const clipTo = `${newLat},${addressInfo.coordinates.lng},15`
      console.log('NewLocation: ' + clipTo)
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

        // console.log('Suggested: ' + JSON.stringify(suggestedAddress, null, 2))
        const suggestedAddress = suggestedAddressResponse.suggestions[0].words
        console.log(`Suggested Address: ${suggestedAddress}`)
        if (suggestedAddress === address) {
          success = true
        }
      } catch (e) {
        console.error(e)
      }
    }
    result.evaluation.success = success
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

  _w3wFromKey (key) {
    console.log('key: ' + key)
    return _.nth(key.match(/\[.*\] \[.*\] \[(.*)\] \[.*\].wav/), 1)
  }
}

What3WordsInterceptor.initialize()

module.exports = What3WordsInterceptor
