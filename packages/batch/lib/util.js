const Util = {
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
