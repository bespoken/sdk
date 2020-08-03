#!/usr/bin/env node
const { program } = require('commander')
const packageJson = require('../package.json')
const BatchRunner = require('../src/batch-runner')
const Job = require('../src/job').Job
const Printer = require('../src/printer')
const Rerunner = require('../src/rerunner')
const Merger = require('../src/merger')

program
  .version(packageJson.version)

program
  .command('list <run> [limit]')
  .description('list all jobs that match filter - up to [limit] jobs that defaults to 10')
  .action(function (run, limit, options) {
    console.info('BBT LIST filter: ' + run)
    const rerunner = new Rerunner()
    rerunner.list(run, limit).then(() => {
      console.info('BBT LIST done')
      process.exit(0)
    })
  })

program
  .command('process <config_file>')
  .description('process config file')
  .option('--output_file <filename>', 'results filename')
  .action(function (config, options) {
    const runner = new BatchRunner(config, options.output_file)
    runner.process().then(() => {
      console.info('RUNNER DONE!')
      process.exit(0)
    })
  })

program
  .command('reprint <batch_key>')
  .description('reprint job')
  .option('--output_file <filename>', 'results filename')
  .option('--sql', 'print to sql')
  .action(function (key, options) {
    Job.lazyFetchJobForKey(key).then(async (job) => {
      await Printer.instance(options.output_file).print(job)
      console.info(JSON.stringify(options.sql, null, 2))
      if (options.sql) {
        const SQLPrinter = require('../src/mysql-printer')
        const sqlPrinter = new SQLPrinter()
        sqlPrinter.print(job)
      }
      console.info('PRINTER REPRINT done')
    })
  })

program
  .command('reprocess <config_file> <batch_key>')
  .description('reprocess job')
  .option('--output_file <filename>', 'results filename')
  .action(function (config, key, options) {
    console.info('BBT REPROCESS key: ' + key)
    const rerunner = new Rerunner(config, key, options.output_file)
    rerunner.rerun().then(() => {
      console.info('BBT REPROCESS done')
      process.exit(0)
    })
  })

program
  .command('reprocessAll <config_file> <run>')
  .description('reprocess all jobs that match filter')
  .action(function (config, run, options) {
    console.log('BBT REPROCESS-ALL run: ' + run)
    const rerunner = new Rerunner(config)
    rerunner.rerunMany(run).then(() => {
      console.info('BBT REPROCESS-ALL done')
      process.exit(0)
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
