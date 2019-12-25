const Metrics = require('./metrics')
const datadog = require('datadog-metrics')

class DataDogMetrics extends Metrics {
  async publish (job, result) {
    let tags = [
      `job:${job.name}`,
      `run:${job.run}`,
      `utterance:${result.utterance}`,
      `voiceId:${result.voiceId}`
    ]

    if (result.tags) {
      tags = tags.concat(result.tags)
    }

    datadog.init({
      defaultTags: tags
    })

    if (result.evaluation.success) {
      datadog.increment('utterance.success', 1)
    } else {
      datadog.increment('utterance.failure', 1)
    }

    datadog.flush()
  }
}

module.exports = DataDogMetrics
