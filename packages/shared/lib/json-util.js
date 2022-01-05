/**
 *
 */
class JSONUtil {
  /**
   *
   * @param {any} target
   * @param {any} json
   * @returns {any}
   */
   static fromJSON (target, json) {
    for (const key of Object.keys(json)) {
      if (target[`_${key}`] !== undefined) {
        target[`_${key}`] = json[key]
      } else {
        target[`${key}`] = json[key]
      }
    }
    return json
  }

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
