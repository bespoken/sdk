const Interceptor = require('@batch-tester/core/lib/interceptor')
const Record = require('@batch-tester/core/lib/source').Record
const Result = require('@batch-tester/core/lib/job').Result

class AlexaAnalyzer {
  expectedIntent(result, intentName) {
    const intent = this._decodeResult(result)
    if (intent.name !== intentName) {
      return new AnalysisResponse(false, 'Wrong intent matched - review the intent model and add this utterance to it')
    } else {
      return new AnalysisResponse(true)
    }
  }

  expectedSlot(result, intentName, slotName, slotValue) {
    const intent = this._decodeResult(result)
    if (intent.name !== intentName) {
      return new AnalysisResponse(false, 'Wrong intent matched - review the intent model and add this utterance to it')
    } 
    
    const slot = intent.slot(slotName)
    if (!slot) {
      if (intent.matchedSlots()) {
        const slotResults = intent.matchedSlots().map(s => `${s.name}[${s.transcript}]`)
        return new AnalysisResponse(false, `Wrong slot matched: ${slotResults}`)
      } else {
        return new AnalysisResponse(false, 'No slot matched - try adding synonyms to the expected slot definition')
      }
    } else if (slot.value !== slotValue) {
      return new AnalysisResponse(false, `Wrong slot value matched: ${slotValue}`)
    } else {
      return new AnalysisResponse(true)
    }
    
  }

  /**
   * Allows for making changes to a result after it has been processed
   * @param {Result} result
   * @returns {IntentResponse} True to include the record, false to exclude it
   */
  _decodeResult (result) {
    const response = result.lastResponse
    console.info('Response: ' + JSON.stringify(response, null, 2))
    const encodedData = response.caption
    return this._decodeContent(encodedData)
  }

  /**
   * 
   * @param {string} encodedData 
   * @returns {IntentResponse}
   */
  _decodeContent(encodedData) {
    //answerquestionintent|playerResponse|undefined|undefined|ALEXA|playerFirstName|undefined|undefined|ALEXA|playerResponseTwo|undefined|undefined|ALEXA|playerLocation|sur|Sur|ALEXA
    const parts = encodedData.split('|')
    const intent = new IntentResponse(parts[0])
    for (let i=1;i<=parts.length;i+=4) {
      intent.addSlot(parts[i], parts[i+1], parts[i+2], parts[i+3])
    }
    return intent
  }
}

class AnalysisResponse {
  /**
   * 
   * @param {boolean} success 
   * @param {string} [advisory]
   */
  constructor(success, advisory) {
    this.success = success
    this.advisory = advisory
  }
}

class IntentResponse {
  constructor(name) {
    this.name = name
    /** @type {Object<string, SlotResponse>} */
    this.slots = {}
  }

  addSlot(name, transcript, value, type) {
    this.slots[name] = new SlotResponse(name, transcript, value, type)
  }

  /**
   * 
   * @returns {SlotResponse[]}
   */
  matchedSlots() {
    return Object.values(this.slots).filter(s => s.value !== undefined)
  }
  /**
   * 
   * @param {string} name
   * @returns {SlotResponse | undefined} 
   */
  slot(name) {
    return this.slots[name]
  }
}

class SlotResponse {
  /**
   * 
   * @param {string} name 
   * @param {string} transcript 
   * @param {string} value 
   * @param {string} type 
   */
  constructor(name, transcript, value, type) {
    this.name = name
    this.transcript = transcript
    this.value = value
    this.type = type
  }

}

module.exports = AlexaAnalyzer