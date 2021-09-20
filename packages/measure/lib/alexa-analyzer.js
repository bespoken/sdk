const logger = require("@bespoken-sdk/shared/lib/logger")('ALEXA')

/**
 * Analyzers Alexa output for accuracy
 */
class AlexaAnalyzer {
  /**
   * @param {any} response
   * @param {string} intentName
   * @returns {AnalysisResponse}
   */
  expectedIntent(response, intentName) {
    const intent = this._decodeResult(response)
    if (intent.name !== intentName) {
      return new AnalysisResponse(false, 'Wrong intent matched - review the intent model and add this utterance to it')
    } else {
      return new AnalysisResponse(true)
    }
  }

  /**
   * @param {any} response
   * @param {string} intentName
   * @param {string} slotName
   * @param {string} slotValue
   * @returns {AnalysisResponse}
   */
  expectedSlot(response, intentName, slotName, slotValue) {
    const intent = this._decodeResult(response)
    if (intent.name !== intentName) {
      return new AnalysisResponse(false, 'Wrong intent matched - review the intent model and add this utterance to it')
    } 
    
    const slot = intent.slot(slotName)
    if (!slot) {
      if (intent.matchedSlots()) {
        const slotResults = intent.matchedSlots().map(s => `SlotName: "${s.name}" SlotValue: "${s.transcript}"`)
        return new AnalysisResponse(false, `Wrong slot matched - ${slotResults}`)
      } else {
        return new AnalysisResponse(false, 'No slot matched - try adding synonyms to the expected slot definition')
      }
    } else if (!slot.value || slot.value.toLowerCase() !== slotValue.toLowerCase()) {
      return new AnalysisResponse(false, `Wrong slot value matched: ${slotValue}`)
    } else {
      return new AnalysisResponse(true)
    }
    
  }

  /**
   * Allows for making changes to a result after it has been processed
   * @param {any} response
   * @returns {IntentResponse} True to include the record, false to exclude it
   */
  _decodeResult (response) {
    const encodedData = response.caption
    logger.info('ALEXA ENCODED response: ' + encodedData)
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

/**
 *
 */
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

/**
 *
 */
class IntentResponse {
  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name
    /** @type {Object<string, SlotResponse>} */
    this.slots = {}
  }

  /**
   * @param {string} name
   * @param {string} transcript
   * @param {string} value
   * @param {string} type
   * @returns {void}
   */
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
    for (const slot of this.matchedSlots()) {
      if (slot.name.toLowerCase() === name.toLowerCase()) {
        return slot
      }
    }

    return undefined
  }
}

/**
 *
 */
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
    this.value = value === 'undefined' ? undefined : value
    this.type = type
  }

}

module.exports = { AlexaAnalyzer, AnalysisResponse }