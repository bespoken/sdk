module.exports = {
  locks: {},
  mutexAcquire: async (lockName = 'default', waitTime = 100) => {
    let lock = this.locks[lockName]
    while (lock === true) {
      await this.sleep(waitTime)
      lock = this.locks[lockName]
    }
    this.locks[lockName] = true
  },

  mutexRelease: async (lockName = 'default') => {
    this.locks[lockName] = false
  },

  sleep: async (sleepTime) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, sleepTime)
    })
  }
}
