const DTO = require('./dto')

/**
 * DTO class for the job
 */
class JobDTO extends DTO {
  constructor (json) {
    super(json)
  }

  /**
   * @returns {string}
   */
  get key() {
    return this.json._key
  }
}

module.exports = JobDTO