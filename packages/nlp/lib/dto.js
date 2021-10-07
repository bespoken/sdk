const uuid = require('uuid')
/**
 * Base class for DTOs
 */
class DTO {
  constructor() {
    this.id = uuid.v4()
    this.createdTimestamp = Math.floor(Date.now() / 1000)
  }
}

module.exports = DTO