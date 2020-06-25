const pino = require('pino')

const ignoredElements = ['pid', 'hostname', 'time']

if (process.env.DISPLAY_LOG_TIME) {
  ignoredElements.pop()
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
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
  },
  prettyPrint: {
    translateTime: 'yyyy-mm-dd HH:MM:ss',
    ignore: ignoredElements.join(','),
    levelFirst: true,
    colorize: process.env.COLORIZE
  }
})

module.exports = logger
