module.exports = {
  sleep: async (sleepTime) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, sleepTime)
    })
  }
}
