#!/usr/bin/env node
const _ = require('lodash')
const BatchRunner = require('../src/batch-runner')
const Printer = require('../src/printer')
const Rerunner = require('../src/rerunner')
const Store = require('../src/store')

const command = _.nth(process.argv, 2)
const argument = _.nth(process.argv, 3)

console.log('command: ' + command + ' arg: ' + argument)
if (command && argument) {
  if (command === 'process') {
    const runner = new BatchRunner(argument)
    runner.process().then(() => {
      console.log('RUNNER DONE!')
    })
  } else if (command === 'reprint') {
    Store.instance().fetch(argument).then(async (job) => {
      await Printer.instance().print(job)
      console.log('PRINTER REPRINT done')
    })
  } else if (command === 'rerun') {
    const rerunner = new Rerunner()
    const key = _.nth(process.argv, 4)
    const encrypt = _.nth(process.argv, 5)
    console.log('KEY: ' + key + ' encrypt: ' + encrypt)
    rerunner.rerun(argument, key, encrypt === true).then(() => {
      console.log('RERUN DONE')
    })
  } else {
    printHelp()
  }
} else {
  printHelp()
}

function printHelp () {
  console.error('To run the Bespoken Batch Tester, must include a command ["process", "reprint"] and a configuration file')
  console.error('For reprint, the second argument should be a run name')
  process.exit(1)
}
