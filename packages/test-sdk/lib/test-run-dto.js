
/** @typedef {( 'COMPLETE' | 'ERROR' | 'IN_PROGRESS')} TestRunStatus  */
/**
 *
 */
class TestRunDTO {
  /**
   * @returns {TestRunStatus}
   */
  get status () {
    return 'IN_PROGRESS'
  }
}

module.exports = TestRunDTO
