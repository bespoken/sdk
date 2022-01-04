/**
 *
 */
class JSONUtil {
  /**
   *
   * @param {any} o
   * @returns {any}
   */
  static toJSON (o) {
    const json = {}
    for (const key of Object.keys(o)) {
      if (key.startsWith('_')) {
        const cleanKey = key.substring(1)
        json[cleanKey] = o[key]
      }
    }
    return json
  }
}

module.exports = JSONUtil
