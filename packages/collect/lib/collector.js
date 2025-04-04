const axios = require('axios')
const Env = require('@bespoken-sdk/shared/lib/env')
const logger = require('@bespoken-sdk/shared/lib/logger')('COLLECT')
const Message = require('@bespoken-sdk/nlp/lib/message')
const Reply = require('@bespoken-sdk/nlp/lib/reply')

/**
 *
 */
class Collector {
  constructor () {

  }

  /**
   * @param {Message} message
   * @returns {Promise<Message>}
   */
  async collectMessage (message) {
    const baseURL = Env.requiredVariable('COLLECT_API_URL', 'https://collect.bespoken.io/collect')
    const url = `${baseURL}/message`
    logger.debug('collect message: ' + message.toStringAsJSON())
    const response = await axios.post(url, message, {
      headers: {
        'content-type': 'application/json'
      }
    })

    const savedMessage = response.data
    message.id = savedMessage.id
    message.conversation.id = savedMessage.conversation.id
    return message
  }

  /**
   * @param {Reply} reply
   * @returns {Promise<void>}
   */
  async collectReply (reply) {
    const baseURL = Env.requiredVariable('COLLECT_API_URL', 'https://collect.bespoken.io/collect')
    const url = `${baseURL}/reply`
    logger.debug('collect reply: ' + JSON.stringify(reply))
    const response = await axios.post(url, reply)

    return response.data
  }
}

module.exports = Collector
