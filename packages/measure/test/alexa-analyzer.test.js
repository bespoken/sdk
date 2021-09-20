const ava = require('@bespoken-sdk/shared/lib/ava-helper')
const AlexaAnalyzer = require('../lib/alexa-analyzer').AlexaAnalyzer

ava('analyze wrong slot matched', async (test) => {
  const analyzer = new AlexaAnalyzer()
  const response = analyzer.expectedSlot({
    caption: 'answerquestionintent|playerResponse|undefined|undefined|ALEXA|playerFirstName|undefined|undefined|ALEXA|playerResponseTwo|undefined|undefined|ALEXA|playerLocation|sur|Sur|ALEXA'
  }, 'answerquestionintent', 'playerResponse', 'serve')
  test.false(response.success)
  test.is(response.advisory, 'Wrong slot matched - SlotName: "playerLocation" SlotValue: "sur"')
})

ava('analyze correct slot matched', async (test) => {
  const analyzer = new AlexaAnalyzer()
  const response = analyzer.expectedSlot({
    caption: 'answerquestionintent|playerResponse|honey|honey|ALEXA|playerLocation|undefined|undefined|ALEXA|playerFirstName|undefined|undefined|ALEXA|playerResponseTwo|undefined|undefined|ALEXA'
  }, 'answerquestionintent', 'playerresponse', 'Honey')
  test.true(response.success)
  test.is(response.advisory, undefined)
})
