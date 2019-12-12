const Metrics = require('./metrics')
const datadog = require('datadog-metrics')

class DataDogMetrics extends Metrics {
  async publish (result) {
    datadog.init({
      defaultTags: [
        `job:${this.job}`,
        `run:${this.run}`,
        `utterance:${result.utterance}`
      ]
    })

    if (result.evaluation.success) {
      datadog.increment('utterance.success', 1)
      datadog.increment('utterance.failure', 0)
    } else {
      datadog.increment('utterance.success', 0)
      datadog.increment('utterance.failure', 1)
    }

    datadog.flush()
  }
}

module.exports = DataDogMetrics
