const _ = require('lodash')
const AWS = require('aws-sdk')

require('dotenv').config()
AWS.config.update({ region: 'us-east-1' })

class CloudWatchMetrics {
  constructor (name) {
    this.logGroup = '/demo/Discovery'
    this._name = name
  }

  async initialize () {
    // Create a new log stream to write to
    const cloudwatch = new AWS.CloudWatchLogs()
    return cloudwatch.createLogStream({
      logGroupName: this.logGroup,
      logStreamName: this._streamName()
    }).promise()
  }

  async publishUtteranceResults (result) {
    return this._publishJSON(result)
  }

  async publishEndToEndResults (result) {
    return this._publishJSON(result)
  }

  async _publishJSON (json, tries = 0) {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.log('CloudWatch NOT configured - set AWS credentials in environment to use CloudWatch')
      return
    }
    json.processTime = this._processTime
    json.name = this._name

    const cloudwatch = new AWS.CloudWatchLogs()
    const payload = {
      logEvents: [{
        message: JSON.stringify(json),
        timestamp: Date.now()
      }],
      logGroupName: this.logGroup,
      logStreamName: this._streamName()
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
          logStreamNamePrefix: this._streamName()
        })
        // Set the sequence token and retry
        this._sequenceToken = logStreams[0].uploadSequenceToken
        await this._publishJSON(json, tries + 1)
      }
    }
    // console.log('PutLog Response: ' + JSON.stringify(response, null, 2))
  }

  _streamName () {
    return this._name + '_' + this._processTime
  }
}

module.exports = CloudWatchMetrics

if (_.nth(process.argv, 2) === 'publish') {
  const publish = new Publisher('/demo/Discovery', 'test-stream')
  publish.initialize().then(() => {
    publish.publishUtteranceResults({ test: 'testValue' }).then(() => {
      console.log('Sequence: ' + publish._sequenceToken)
      return publish.publishUtteranceResults({ test: 'testValue' })
    }).then(() => {
      console.log('Sequence: ' + publish._sequenceToken)
    })
  })
}
