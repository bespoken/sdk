module.exports = {
  sleep: async (sleepTime) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, sleepTime)
    })
  }

  concatenateAudio: async (file1, file2) => {
    return new Promise((resolve) => {
      const command = '/Users/jpk/apps/ffmpeg/bin/ffmpeg'
      const args = []
      process.execFile()
    }
    
  }
}
