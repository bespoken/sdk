#!/usr/bin/env node
const _ = require('lodash')
const BatchRunner = require('../src/batch-runner')

const command = _.nth(process.argv, 2)
const configFile = _.nth(process.argv, 3)

console.log('command: ' + command + ' file: ' + configFile)
if (command && configFile) {
  const runner = new BatchRunner(configFile)
  runner.process().then(() => {
    console.log('RUNNER DONE!')
  })
} else {
  console.error('To run the Bespoken Batch Tester, must include a command ["process"] and a configuration file')
  process.exit(1)
}
