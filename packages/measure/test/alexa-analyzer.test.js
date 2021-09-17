const ava = require('@bespoken-sdk/shared').ava
const AlexaAnalyzer = require('../lib/alexa-analyzer').AlexaAnalyzer

ava('analyze wrong slot matched', async (test) => {
  const analyzer = new AlexaAnalyzer()
  const response = analyzer.expectedSlot({
    caption: 'answerquestionintent|playerResponse|undefined|undefined|ALEXA|playerFirstName|undefined|undefined|ALEXA|playerResponseTwo|undefined|undefined|ALEXA|playerLocation|sur|Sur|ALEXA'
  }, 'answerquestionintent', 'playerresponse', 'serve')
  test.false(response.success)
  test.is(response.advisory, 'Wrong slot matched - SlotName: "playerLocation" SlotValue: "sur"')
})
