const uuid = require('uuid')
module.exports = class {
  constructor() {
    this.id = uuid.v4()
    this.createdTimestamp = Date.now()
  }
}