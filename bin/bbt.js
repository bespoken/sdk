#!/usr/bin/env node
const { program } = require('commander')
const packageJson = require('../package.json')
const BatchRunner = require('../src/batch-runner')
const Printer = require('../src/printer')
const Rerunner = require('../src/rerunner')
const Store = require('../src/store')
const Merger = require('../src/merger')

program
  .version(packageJson.version)

program
  .command('process <config_file>')
  .description('process config file')
  .option('--output_file <filename>', 'results filename')
  .action(function (config, options) {
    const runner = new BatchRunner(config, options.output_file)
    runner.process().then(() => {
      console.info('RUNNER DONE!')
    })
  })

program
  .command('reprint <batch_key>')
  .description('reprint job')
  .option('--output_file <filename>', 'results filename')
  .action(function (key, options) {
    Store.instance().fetch(key).then(async (job) => {
      await Printer.instance(options.output_file).print(job)
      console.info('PRINTER REPRINT done')
    })
  })

program
  .command('reprocess <config_file> <batch_key> [encrypt]')
  .description('reprocess job')
  .option('--output_file <filename>', 'results filename')
  .action(function (config, key, encrypt = false, options) {
    console.log('KEY: ' + key + ' encrypt: ' + encrypt)
    const rerunner = new Rerunner(config, key, encrypt, options.output_file)
    rerunner.rerun().then(() => {
      console.info('RERUN DONE')
    })
  })

program
  .command('merge [original_results] [rerun_results]')
  .description('merge two csv files')
  .option('--output_file <filename>', 'results filename')
  .action(function (original, rerun, options) {
    const merger = new Merger(original, rerun, options.output_file)
    merger.merge().then(() => {
      console.info('MERGE DONE')
    })
  })

program.parse(process.argv)
