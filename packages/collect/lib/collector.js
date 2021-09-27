const Message = require('./message')
const Reply = require('./reply')

/**
 *
 */
class Collector {
  constructor() {

  }

  /**
   * @param {Message} message
   * @returns {Promise<void>}
   */
  async collectMessage(message) {
    // TODO call axios with url for collector
  } 
  
  /**
   * @param {Reply} reply
   * @returns {Promise<void>}
   */
  async collectReply(reply) {
    // TODO call axios with url for collector
  } 
}

module.exports = Collector