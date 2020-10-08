const AWS = require('aws-sdk')
const Config = require('./config')

const SESConfig = {
  accessKeyId: process.env.NOTIFICATION_ACCESS_KEY_ID,
  secretAccessKey: process.env.NOTIFICATION_SECRET_ACCESS_KEY
}

const SES = new AWS.SES(SESConfig)

class EmailNotifier {
  static instance () {
    return Config.instance('email-notifier', EmailNotifier)
  }

  content () {
    const jobName = Config.get('job', undefined, true)
    const subject = `Bespoken Batch Tester Job: ${jobName} completed`
    let body = `The job ${jobName} has completed.`
    if (process.env.CI_JOB_URL) {
      body += `\n\nReview the results here:\n${process.env.CI_JOB_URL}`
    }
    return {
      subject,
      body
    }
  }

  async send () {
    const { subject, body } = this.content()
    const addresses = process.env.NOTIFICATION_EMAILS.split(',')
    const params = {
      Destination: {
        ToAddresses: addresses
      },
      Message: {
        Body: {
          Text: { Data: body }
        },
        Subject: { Data: subject }
      },
      Source: 'notifier@bespoken.io'
    }

    try {
      await SES.sendEmail(params).promise()
      console.info('EMAIL NOTIFICATION SENT')
    } catch (error) {
      console.error('EMAIL NOTIFICATION ERROR: ', error)
    }
  }

  get canSend () {
    return process.env.NOTIFICATION_EMAILS &&
           process.env.NOTIFICATION_ACCESS_KEY_ID &&
           process.env.NOTIFICATION_SECRET_ACCESS_KEY
  }
}

module.exports = EmailNotifier
