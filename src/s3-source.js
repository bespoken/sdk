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
      // const url = `https://${bucket}.s3.amazonaws.com/${content.Key}`
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: content.Key
      })
      console.log('Key: ' + content.Key + ' Signed URL: ' + signedUrl)

      return {
        utterance: signedUrl,
        meta: content
      }
    })
    return records
  }
}

module.exports = S3Source
