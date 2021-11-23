const axios = require('axios').default
const Env = require('@bespoken-sdk/shared/lib/env')
const Message = require('@bespoken-sdk/nlp/lib/message')
const Reply = require('@bespoken-sdk/nlp/lib/reply')

/**
 *
 */
class Collector {
  constructor() {

  }

  /**
   * @param {Message} message
   * @returns {Promise<Message>}
   */
  async collectMessage(message) {
    const baseURL = Env.requiredVariable('COLLECT_API_URL')
    const url = `${baseURL}/message`
    console.info('collect essage: ' + JSON.stringify(message))
    const response = await axios.post(url, message)
    
    return response.data
  } 
  
  /**
   * @param {Reply} reply
   * @returns {Promise<void>}
   */
  async collectReply(reply) {
    const baseURL = Env.requiredVariable('COLLECT_API_URL')
    const url = `${baseURL}/reply`
    console.info('collect reply: ' + JSON.stringify(reply))
    const response = await axios.post(url, reply)
    
    return response.data
  } 
}

module.exports = Collector