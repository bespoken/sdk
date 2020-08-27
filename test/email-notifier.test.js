/* eslint-env jest */
const Config = require('../src/config')
const EmailNotifier = require('../src/email-notifier')

describe('Email Notifier', () => {
  test('can not send email', () => {
    const notifier = EmailNotifier.instance()
    expect(notifier.canSend).toBeFalsy()
  })

  test('can send email', () => {
    const OLD_ENV = { ...process.env }
    process.env.NOTIFICATION_EMAILS = 'support@bespoken.io,bespoken@bespoken.io'
    process.env.NOTIFICATION_ACCESS_KEY_ID = '12341234'
    process.env.NOTIFICATION_SECRET_ACCESS_KEY = '12314234'
    const notifier = EmailNotifier.instance()
    expect(notifier.canSend).toBeTruthy()
    process.env = OLD_ENV
  })

  describe('Email Content', () => {
    const OLD_ENV = { ...process.env }

    beforeEach(() => {
      const config = {
        job: 'test',
        customer: 'jest'
      }
      Config.loadFromJSON(config)
    })

    afterEach(() => {
      process.env = OLD_ENV
    })

    test('from console', () => {
      process.env.CI_JOB_URL = undefined
      const email = EmailNotifier.instance().send()
      expect(email.subject).toEqual('Bespoken Batch Tester Job: test completed')
      expect(email.body).toEqual('The job test has completed.')
    })

    test('from gitlab', () => {
      process.env.CI_JOB_URL = 'https://gitlab.com/bespoken/batch-tester/-/pipelines/12341234'
      const email = EmailNotifier.instance().send()
      expect(email.subject).toEqual('Bespoken Batch Tester Job: test completed')
      expect(email.body).toEqual('The job test has completed.\n\nReview the results here:\nhttps://gitlab.com/bespoken/batch-tester/-/pipelines/12341234')
    })
  })
})
