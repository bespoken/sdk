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
  } else if (command === 'reprocess') {
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
  console.error('To run the Bespoken Batch Tester:')
  console.error('Include a command ["process", "reprint", "reprocess"] and a configuration file')
  console.error('For reprint, a second argument is required - the run key')
  console.error('For reprocess, a second argument is required - the run key')
  process.exit(1)
}
