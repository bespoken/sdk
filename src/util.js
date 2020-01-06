const Util = {
  locks: {},
  mutexAcquire: async (lockName = 'default', waitTime = 100, attempt = 1, maxAttempts = 1) => {
    const lock = Util.locks[lockName]
    if (lock === true) {
      console.error('UTIL MUTEXACQUIRE failed on attempt: {attempt}')
      // Give up after three tries
      if (attempt >= maxAttempts) {
        return false
      }
      await Util.sleep(waitTime)
      return Util.mutexAcquire(lockName, waitTime, attempt + 1)
    }
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
