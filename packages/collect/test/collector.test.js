const ava = require('@bespoken-sdk/shared/lib/ava-helper')
const Collector = require('../lib/collector')
const Conversation = require('@bespoken-sdk/nlp/lib/conversation')
const InputSettings = require('@bespoken-sdk/nlp/lib/input-settings')
const Message = require('@bespoken-sdk/nlp/lib/message')
const Recognition = require('@bespoken-sdk/nlp/lib/recognition')
const RecognitionResult = require('@bespoken-sdk/nlp/lib/recognition-result')
const Reply = require('@bespoken-sdk/nlp/lib/reply')

require('dotenv').config()

ava('save message', async (test) => {
  const collector = new Collector()
  const conversation = new Conversation({}, 'TWILIO', 'collector-test-external-id')
  const message = new Message(conversation, new InputSettings('VOICE').setDialogState('ELICIT_SLOT'))
  const savedMessage = await collector.collectMessage(message)
  // @ts-ignore
  test.assert(savedMessage.id)
})


ava.only('save reply', async (test) => {
  const collector = new Collector()
  const conversation = new Conversation({}, 'TWILIO', 'collector-test-external-id')
  const message = new Message(conversation, new InputSettings('VOICE').setDialogState('ELICIT_SLOT'))
  const recognition = new Recognition(message, {}, 'AZURE')
  recognition.addResult(new RecognitionResult('transcript', .95, 0, {}))
  const reply = new Reply(message).setRecognition(recognition)

  const savedReply = await collector.collectReply(reply)
  // @ts-ignore
  test.assert(savedReply.id)
})
