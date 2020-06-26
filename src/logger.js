var fs = require('fs')
var pinoms = require('pino-multi-stream')

const ignoredElements = ['pid', 'hostname', 'time']

if (process.env.DISPLAY_LOG_TIME) {
  ignoredElements.pop()
}

var prettyStream = pinoms.prettyStream({
  prettyPrint: {
    translateTime: 'yyyy-mm-dd HH:MM:ss',
    ignore: ignoredElements.join(','),
    levelFirst: true,
    colorize: process.env.COLORIZE
  }
})

var streams = [
  prettyStream
]

if (process.env.SAVE_LOG_FILE) {
  streams.push({ stream: fs.createWriteStream('output/batch-tester.log') })
}

var logger = pinoms({
  streams: streams,
  formatters: {
    log (object) {
      const message = object.msg || ''
      let formattedMessage = message
      const parts = message.split(' ')
      if (parts.length >= 3) {
        const [module, method, ...content] = parts
        formattedMessage = module.padEnd(10) + method.padEnd(10) + content.join(' ')
      }
      object.msg = formattedMessage
      return object
    }
  }
})
logger.level = process.env.LOG_LEVEL || 'info'
module.exports = logger
