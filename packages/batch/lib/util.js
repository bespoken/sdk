const Config = require('@bespoken-sdk/shared/lib/config')
const crypto = require('crypto')

const Util = {
  decrypt: (value) => {
    const decipher = crypto.createDecipher('aes-256-cbc', Config.env('ENCRYPTION_KEY'))
    let decrypted = decipher.update(value, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted
  },

  encrypt: (value) => {
    const cipher = crypto.createCipher('aes-256-cbc', Config.env('ENCRYPTION_KEY'))
    let crypted = cipher.update(value, 'utf-8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  },

  locks: {},
  mutexAcquire: async (lockName = 'default', waitTime = 100, attempt = 1, maxAttempts = 1) => {
    const lock = Util.locks[lockName]
    if (lock === true) {
      if (attempt === 0) {
        console.log(`UTIL MUTEX-ACQUIRE waiting: ${lockName}`)
      }
      // Give up after three tries
      if (maxAttempts > 0 && attempt >= maxAttempts) {
        return false
      }
      await Util.sleep(waitTime)
      return Util.mutexAcquire(lockName, waitTime, attempt + 1, maxAttempts)
    }
    console.log(`UTIL MUTEX-ACQUIRE acquired: ${lockName}`)
    Util.locks[lockName] = true
    return true
  },

  mutexRelease: async (lockName = 'default') => {
    Util.locks[lockName] = false
  },

  sleep: async (sleepTime) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, sleepTime)
    })
  }
}

module.exports = Util
