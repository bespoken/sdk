const AWS = require('aws-sdk')
const Config = require('@bespoken-sdk/shared/lib/config')
const logger = require('@bespoken-sdk/shared/lib/logger')('EMAIL')

const SESConfig = {
  accessKeyId: process.env.NOTIFICATION_ACCESS_KEY_ID,
  region: process.env.AWS_SES_REGION,
  secretAccessKey: process.env.NOTIFICATION_SECRET_ACCESS_KEY
}

const SES = new AWS.SES(SESConfig)

/**
 *
 */
class EmailNotifier {
  /**
   * @returns {EmailNotifier}
   */
  static instance () {
    return Config.instance('email-notifier', EmailNotifier)
  }

  /**
   * @returns {any}
   */
  content () {
    const jobName = Config.get('job', true)
    const subject = `Bespoken Batch Tester Job: ${jobName} completed`
    let body = `The job ${jobName} has completed.`
    if (process.env.CI_JOB_URL) {
      body += `\n\nReview the results here:\n${process.env.CI_JOB_URL}`
    }
    return {
      body,
      subject
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async send () {
    if (!process.env.NOTIFICATION_EMAILS) {
      logger.error('No NOTIFICATION_EMAILS environment variable set')
      return
    }
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
      console.error(`EMAIL NOTIFICATION ERROR: ${error.toString()}`)
    }
  }

  /**
   * @returns {boolean}
   */
  get canSend () {
    return process.env.NOTIFICATION_EMAILS !== undefined &&
           process.env.NOTIFICATION_ACCESS_KEY_ID !== undefined&&
           process.env.NOTIFICATION_SECRET_ACCESS_KEY !== undefined
  }
}

module.exports = EmailNotifier
