const AWS = require('aws-sdk')
const Config = require('@bespoken-sdk/shared/lib/config')
const Record = require('./source').Record
const Source = require('./source').Source

/**
 *
 */
class S3Source extends Source {
  /**
   *
   */
  static connection () {
    if (!S3Source.s3) {
      S3Source.s3 = new AWS.S3()
    }
    return S3Source.s3
  }

  /**
   *
   */
  async loadAll () {
    const bucket = this.sourceBucket
    const contents = await this._listObjects(bucket)
    const records = contents.map(content => {
      return new Record(content.Key, {}, content)
    })
    return records
  }

  /**
   * @param record
   */
  async loadRecord (record) {
    record.meta.signedUrl = S3Source.urlForKey(this.sourceBucket, record.meta.Key)
    return Promise.resolve()
  }

  /**
   * @param bucket
   * @param key
   */
  static urlForKey (bucket, key) {
    return S3Source.connection().getSignedUrl('getObject', {
      Bucket: bucket,
      Key: key
    })
  }

  /**
   * @param bucket
   * @param token
   */
  async _listObjects (bucket, token) {
    var params = {
      Bucket: bucket
    }

    if (token) {
      params.ContinuationToken = token
    }

    const s3 = new AWS.S3()
    const response = await s3.listObjectsV2(params).promise()
    console.log(`S3Source Token: ${token} List: ${response.Contents.length}`)

    let contents = response.Contents
    if (response.NextContinuationToken) {
      const moreObjects = await this._listObjects(bucket, response.NextContinuationToken)
      contents = contents.concat(moreObjects)
    }

    return contents
  }

  /**
   *
   */
  get sourceBucket () {
    return Config.get('sourceBucket', true)
  }
}

module.exports = S3Source
