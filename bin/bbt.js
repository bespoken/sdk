#!/usr/bin/env node
const BatchRunner = require('../src/batch-runner')
const Printer = require('../src/printer')
const Rerunner = require('../src/rerunner')
const Store = require('../src/store')
const Merger = require('../src/merger')

const [, , command, ...args] = process.argv

console.log('command: ' + command + ' args: ' + args.join(', '))

if (command === 'process') {
  const [config, outputPath] = args
  const runner = new BatchRunner(config, outputPath)
  runner.process().then(() => {
    console.log('RUNNER DONE!')
  })
} else if (command === 'reprint') {
  const [key, outputPath] = args
  Store.instance().fetch(key).then(async (job) => {
    await Printer.instance(outputPath).print(job)
    console.log('PRINTER REPRINT done')
  })
} else if (command === 'reprocess') {
  const [config, key, encrypt, outputPath] = args
  console.log('KEY: ' + key + ' encrypt: ' + encrypt)
  const rerunner = new Rerunner(config, key, encrypt, outputPath)
  rerunner.rerun().then(() => {
    console.log('RERUN DONE')
  })
} else if (command === 'merge') {
  const merger = new Merger(...args.slice(0, 3))
  merger.merge().then(() => {
    console.log('MERGE DONE')
  })
} else {
  printHelp()
}

function printHelp () {
  console.error('To run the Bespoken Batch Tester:')
  console.error('Include a command ["process", "reprint", "reprocess", "merge"] and a configuration file')
  console.error('For reprint, a second argument is required - the run key')
  console.error('For reprocess, a second argument is required - the run key')
  process.exit(1)
}
