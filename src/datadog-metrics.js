const Metrics = require('./metrics')
const datadog = require('datadog-metrics')

class DataDogMetrics extends Metrics {
  async publish (job, result) {
    const tags = [
      `customer:${job.customer}`,
      `job:${job.name}`,
      `run:${job.run}`,
      `utterance:${result.record.utteranceRaw}`,
      `voiceId:${result.voiceId}`
    ]

    if (result.tags) {
      for (const key of Object.keys(result.tags)) {
        const value = result.tags[key]
        tags.push(`${key}:${value}`)
      }
    }

    // Add the actual fields to the tags
    for (const field of Object.keys(result.actualFields)) {
      const value = result.actualFields[field]
      tags.push(`actual-${field}:${value}`)
    }

    // Add the expected fields to the tags
    for (const field of Object.keys(result.record.expectedFields)) {
      const value = result.record.expectedFields[field]
      tags.push(`expected-${field}:${value}`)
    }

    // Add the output fields to the tags
    for (const field of Object.keys(result.outputFields)) {
      const value = result.outputField(field)
      tags.push(`${field}:${value}`)
    }

    datadog.init({
      defaultTags: tags
    })

    const error = result.error ? 1 : 0
    const success = result.success ? 1 : 0
    const failure = !result.success && !result.error ? 1 : 0

    datadog.increment('utterance.error', error)
    datadog.increment('utterance.success', success)
    datadog.increment('utterance.failure', failure)

    datadog.flush()
  }
}

module.exports = DataDogMetrics
