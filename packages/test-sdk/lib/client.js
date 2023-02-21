const axios = require('axios').default
const JSONUtil = require('@bespoken-api/shared/lib/json-util')
const TestDTO = require('./test-dto')
const TestResultDTO = require('./test-result-dto')
const TestRunDTO = require('./test-run-dto')
const Util = require('@bespoken-api/shared/lib/util')

/**
 * Client for Bespoken testing, training and monitoring API
 */
class Client {
  /**
   *
   * @param {string} apiKey
   * @param {string} [baseURL]
   */
  constructor (apiKey, baseURL) {
    this.apiKey = apiKey
    this.baseURL = baseURL || 'https://test-api.bespoken.io'
  }

  /**
   *
   * @param {string} testSuiteName
   * @param {Object<string, string>} variables
   * @returns {Promise<TestResultDTO>}
   */
  async run (testSuiteName, variables) {
    const runURL = `${this.baseURL}/test-suite/${testSuiteName}/run?apiKey=${this.apiKey}`
    let response
    try {
      response = await axios.get(runURL)
    } catch (e) {
      console.info('error: ' + e.status)
      if (e.message.includes('401')) {
        throw new Error('Invalid API key')
      }
      throw e
    }
    const runID = response.data.id
    let status = response.data.status

    const statusURL = `${this.baseURL}/test-run/${runID}?apiKey=${this.apiKey}`
    let runStatusResponse
    while (status === 'IN_PROGRESS') {
      await Util.sleep(1000)
      runStatusResponse = await axios.get(statusURL)
      status = runStatusResponse.data.status
    }
    console.info('response:\n' + JSONUtil.safeStringify(runStatusResponse?.data, 2))
    return new TestResultDTO(/** @type {any} */ (runStatusResponse?.data))
  }

  /**
   *
   * @param {TestDTO} test
   * @returns {Promise<TestDTO>}
   */
  async saveTest (test) {
    return new TestDTO()
  }

  /**
   *
   * @param {TestSuiteDTO} testSuite
   * @returns {Promise<TestSuiteDTO>}
   */
  async saveTestSuite (testSuite) {
    return new TestSuiteDTO()
  }

  /**
   * @param {string} testRunID
   * @returns {Promise<TestRunDTO>}
   */
  async status (testRunID) {
    return new TestRunDTO()
  }
}

module.exports = Client
