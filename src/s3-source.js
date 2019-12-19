const AWS = require('aws-sdk')
const Config = require('./config')
const Source = require('./source')

class S3Source extends Source {
  async load () {
    const bucket = Config.get('sourceBucket', undefined, true)
    return this._listObjects(bucket)
  }

  async _listObjects (bucket, token) {
    var params = {
      Bucket: bucket
    }

    if (token) {
      params.ContinuationToken = token
    }

    const s3 = new AWS.S3()
    const response = await s3.listObjectsV2(params).promise()
    let contents = response.Contents
    if (response.NextContinuationToken) {
      contents = contents.concat(this._listObjects(bucket, response.NextContinuationToken))
    }

    const records = contents.map(content => {
      console.log('Key: ' + content.Key)
      const url = `https://${bucket}.s3.amazonaws.com/${content.Key}`
      return {
        utterance: url,
        info: content
      }
    })
    return records
  }
}

module.exports = S3Source
