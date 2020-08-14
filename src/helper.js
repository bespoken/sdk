const Fuse = require('fuse.js')

class Helper {
  static fuzzyMatch (textToSearch, phrasesToMatch, threshold = 0.20) {
    const fuse = new Fuse(phrasesToMatch, { includeScore: true, ignoreLocation: true })
    const matches = fuse.search(textToSearch)
    if (matches.length === 0) {
      return false
    }
    const closestMatch = matches[0]
    return closestMatch.score <= threshold
  }
}

module.exports = Helper
