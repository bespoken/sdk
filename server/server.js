const _ = require('lodash')
const fs = require('fs')
const http = require('http')
const Store = require('../src/store')
const URL = require('url')

class Server {
  constructor (listener) {
    this.listener = listener
  }

  async start (port = 3000) {
    return new Promise((resolve) => {
      this.server = http.createServer((message, response) => {
        let data = Buffer.alloc(0)
        this.buffer = message.on('data', (chunk) => {
          // console.log('Buffer: ' + chunk)
          data = Buffer.concat([data, chunk])
        })

        message.on('end', async () => {
          let json = {}
          if (data.length > 0) {
            json = JSON.parse(data)
          }
          this._handleRequest(message, response, json)
        })
      })

      this.server.listen(port, () => {
        console.log('SERVER started')
        resolve()
      })
    })
  }

  async _handleRequest (message, response, json) {
    const url = URL.parse(message.url, true) /* eslint-disable-line */
    const path = url.pathname

    if (path === '/save') {
      console.log(`SERVER HANDLE save: ${JSON.stringify(json)}`)
      await Store.instance().save(json)

      response.end('{ success: true }')
    } else if (path === '/fetch') {
      const run = url.query.run

      console.log(`SERVER HANDLE fetch: ${run}`)
      const job = await Store.instance().fetch(run)
      response.end(JSON.stringify(job))
    } else {
      const packageData = fs.readFileSync('package.json')
      const packageJSON = JSON.parse(packageData)
      response.end(`BATCH-TESTER-DATA VERSION: ${packageJSON.version}`)
    }
  }

  stop () {
    return new Promise((resolve) => {
      console.log('SERVER STOP CALLED')

      this.server.close(() => {
        console.log('SERVER STOPPED')
        resolve()
      })
    })
  }
}

module.exports = Server

const command = _.nth(process.argv, 2)
if (command === 'run') {
  const server = new Server()

  server.start().then(() => {
    console.log('SERVER STARTED')
  })
}

process.on('uncaughtException', (e) => {
  console.error('UNCAUGHT: ' + e)
  console.error('UNCAUGHT STACK: ' + e.stack)
})

process.on('unhandledRejection', (e) => {
  console.error('UNHANDLED: ' + e)
  console.error('UNHANDLED: ' + e.stack)
})
