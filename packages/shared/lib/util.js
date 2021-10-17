/**
 * Utility methods
 */
class Util {

  /**
   * @param {number} time
   * @returns {Promise<void>}
   */
  static async sleep (time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }
}

module.exports = Util
