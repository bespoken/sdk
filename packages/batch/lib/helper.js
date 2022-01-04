const _ = require('lodash')
const Fuse = require('fuse.js').default

/**
 *
 */
class Helper {
  /**
   *
   * @param {string} patternToMatch The string to search for
   * @param {string|string[]} textToSearch The string, or array of strings, to search in
   * @param {number} threshold The maximum value of the distance for this to be considered true
   * @returns {boolean}
   */
  static fuzzyMatch (patternToMatch, textToSearch, threshold = 0.20) {
    if (!_.isArray(textToSearch)) {
      textToSearch = [textToSearch]
    }
    const fuse = new Fuse(textToSearch, { ignoreLocation: true, includeScore: true})
    const matches = fuse.search(patternToMatch)
    if (matches.length === 0) {
      return false
    }

    const closestMatch = matches[0]
    if (!closestMatch.score) {
      return false
    }
    return closestMatch.score <= threshold
  }
}

module.exports = Helper
