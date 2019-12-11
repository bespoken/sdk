- how to deal with different results in the recipe sequence based on different contextual elements
  - could be user, device, etc.
- behavior with recipes varies based on whether a hint is being shown
- main thing is making sure the user can go through the entire sequence
  - as well as doing back and repeat, and ask for a specific step

- what are the recommendations for monitoring

- currently using cloudwatch logs and some new relic

- testing of live-classes

POC Items:
- regression test cases
- search by shows
- do VSK integration

POC Suggestions:
- integration with cloudwatch
- leveraging UPT for testing recipe names
- using jenkins for running tests on a regular interval

Course is a collection of classes

Howtos are videos on how to do basic stuff like chopping an onion

Ideally want to get to 100% coverage
- Highlight different dimensions of coverage
- what is realistic from a test coverage basis as well as frequency