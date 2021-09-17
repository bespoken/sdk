/* eslint-env jest */
const Helper = require('../src/helper')

describe('Fuzzy matching', () => {
  let textToSearch = 'Z100 Radio'
  let phrasesToMatch = ['playing Z100 Radio', 'Z100 Radio']
  test('matches phrase', () => {
    const isValid = Helper.fuzzyMatch(textToSearch, phrasesToMatch)
    expect(isValid).toBeTruthy()
  })

  test('does not match phrase', () => {
    textToSearch = 'different phrase'
    const isValid = Helper.fuzzyMatch(textToSearch, phrasesToMatch)
    expect(isValid).toBeFalsy()
  })

  test('changes the threshold', () => {
    textToSearch = 'Z100 Radio'
    phrasesToMatch = ['playing Z1o0 Radio']
    // Default threshold is 0.20
    let isValid = Helper.fuzzyMatch(textToSearch, phrasesToMatch)
    expect(isValid).toBeFalsy()
    // Change threshold to 0.35
    isValid = Helper.fuzzyMatch(textToSearch, phrasesToMatch, 0.35)
    expect(isValid).toBeTruthy()
  })
})
