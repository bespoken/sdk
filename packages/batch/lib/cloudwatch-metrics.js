const _ = require('lodash')
const AWS = require('aws-sdk')
const Config = require('@bespoken-sdk/shared/lib/config')
const Job = require('./job').Job
const Metrics = require('./metrics')
const Result = require('./job').Result

/**
 *
 */
class CloudWatchMetrics extends Metrics {
  /**
   * @param job
   */
  async initialize (job) {
    this.logGroup = Config.get('cloudwatchLogGroup', true)

    // Create a new log stream to write to
    const cloudwatch = new AWS.CloudWatchLogs()
    return cloudwatch.createLogStream({
      logGroupName: this.logGroup,
      logStreamName: job.run
    }).promise()
  }

  /**
   * @param job
   * @param result
   */
  async publish (job, result) {
    return this._publishImpl(job, result)
  }

  /**
   *
   * @param {Job} job
   * @param {Result} result
   * @param {Number} [tries=0]
   */
  async _publishImpl (job, result, tries = 0) {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.error('CloudWatch NOT configured - set AWS credentials in environment to use CloudWatch')
      return
    }
    // Turn the result into JSON - we use JS getters and setters, so need to do this one-by-one
    const json = {
      actualFields: result.actualFields,
      lastResponse: result.lastResponse,
      outputFields: result.outputFields,
      record: result.record,
      success: result.success,
      tags: result.tags,
      voiceId: result.voiceId
    }
    json.processTime = job.processTime
    json.name = job.name

    const cloudwatch = new AWS.CloudWatchLogs()
    const payload = {
      logEvents: [{
        message: JSON.stringify(json),
        timestamp: Date.now()
      }],
      logGroupName: this.logGroup,
      logStreamName: job.run
    }

    if (this._sequenceToken) {
      payload.sequenceToken = this._sequenceToken
    }
    try {
      const response = await cloudwatch.putLogEvents(payload).promise()
      this._sequenceToken = response.nextSequenceToken
    } catch (e) {
      console.error(e)
      if (tries > 2) {
        // Giving up on retries to send to cloudwatch
        return
      }

      if (e.message.includes('The given sequenceToken is invalid')) {
        const logStreams = await cloudwatch.describeLogStreams({
          descending: true,
          logGroupName: this.logGroup,
          logStreamNamePrefix: job.run
        })
        // Set the sequence token and retry
        this._sequenceToken = logStreams[0].uploadSequenceToken
        await this._publishJSON(job, result, tries + 1)
      }
    }
    // console.log('PutLog Response: ' + JSON.stringify(response, null, 2))
  }
}

module.exports = CloudWatchMetrics
