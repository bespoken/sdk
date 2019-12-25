const Metrics = require('./metrics')
const datadog = require('datadog-metrics')

class DataDogMetrics extends Metrics {
  async publish (job, result) {
    const tags = [
      `job:${job.name}`,
      `run:${job.run}`,
      `utterance:${result.utterance}`,
      `voiceId:${result.voiceId}`
    ]

    if (result.tags) {
      for (const key of Object.keys(result.tags)) {
        const value = result.tags[key]
        tags.push(`${key}:${value}`)
      }
    }

    datadog.init({
      defaultTags: tags
    })

    if (result.success) {
      datadog.increment('utterance.success', 1)
    } else {
      datadog.increment('utterance.failure', 1)
    }

    datadog.flush()
  }
}

module.exports = DataDogMetrics
