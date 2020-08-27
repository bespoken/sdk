const Config = require('./config')

class EmailNotifier {
  static instance () {
    return Config.instance('email-notifier', EmailNotifier)
  }

  send () {
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

  get canSend () {
    return process.env.NOTIFICATION_EMAILS &&
           process.env.NOTIFICATION_ACCESS_KEY_ID &&
           process.env.NOTIFICATION_SECRET_ACCESS_KEY
  }
}

module.exports = EmailNotifier
