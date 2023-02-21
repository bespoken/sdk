const ava = require('ava').default
const Client = require('../lib/client')

ava('run test', async (t) => {
  t.timeout(120000)
  const client = new Client('api-ax30ZdK59shsVmrjgTRkhcG2S1l2', 'http://localhost:3000')
  await client.run('First-Test', { name: 'John' })
})
