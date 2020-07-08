/* eslint-env jest */
const Config = require('../src/config')
const { Job, Result } = require('../src/job')
const Printer = require('../src/sqlite-printer')
const Record = require('../src/source').Record

describe('configuration tests', () => {
  beforeEach(() => {
    Config.reset()
  })

  test('check printing to sqlite', async () => {
    const config = {
      customer: 'customer',
      job: 'job'
    }

    Config.loadFromJSON(config)
    const printer = new Printer()
    const job = new Job('UnitTest')
    const record = new Record('Utterance')
    record.addExpectedField('field1', 'expected1')
    const result = new Result(record)
    result.success = true
    result.addOutputField('output1', 'output1')
    result.addOutputField('output two', 'output2')
    result.addActualField('field1', 'actual1')
    job.addResult(result)
    job.records = [record]

    await reset(printer)
    await printer.print(job)
    const results = await printer._all('SELECT * FROM results')
    expect(results[0].OUTPUT1).toBe('output1')
    expect(results[0].OUTPUT_TWO).toBe('output2')
    expect(results[0].ACTUAL_FIELD1).toBe('actual1')
    expect(results[0].EXPECTED_FIELD1).toBe('expected1')
  })

  test('check printing to sqlite with changed table', async () => {
    const config = {
      customer: 'customer',
      job: 'job'
    }

    Config.loadFromJSON(config)
    let printer = new Printer()
    let job = new Job('UnitTest')
    let record = new Record('Utterance')
    let result = new Result(record)
    result.success = true
    result.addOutputField('output1', 'value1')
    result.addActualField('actual1', 'value1')
    job.addResult(result)
    job.records = [record]

    await reset(printer)
    await printer.print(job)

    printer = new Printer()
    job = new Job('UnitTest')
    record = new Record('Utterance')
    result = new Result(record)
    result.success = true
    result.addOutputField('output1', 'value1')
    result.addOutputField('output2', 'value2')
    result.addActualField('actual1', 'value1')
    job.addResult(result)
    job.records = [record]

    await printer.print(job)
    const hasColumn = await printer._hasColumn('OUTPUT2')
    expect(hasColumn).toBe(true)
  })
})

async function reset (printer) {
  try {
    await printer.drop()
  } catch (e) {

  }
}
