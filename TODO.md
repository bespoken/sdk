## Critical
- [X] Add source interface
- [X] Add filter
  - [X] On source
  - [X] On results
- [X] Add http support
- [X] Concatenate audio
- [ ] Update datadog key
- [X] Save as we go along
  - [X] Allow for resume
  - [X] Label each job uniquely
- [ ] Get stuff from What3Words
  - [ ] Load audio into S3
  - [ ] Get the real interaction model
- [ ] Add locking logic on saving data

## Nice-to-have
- [ ] Use jsdoc on source.js and evaluator
- [ ] make sure expiry on s3 URL is long enough
- [ ] update package.json info
- [ ] Add locale support
- [ ] Where to store custom files?
  - [ ] https://stackoverflow.com/questions/53391229/clone-another-gitlab-repository-in-gitlab-ci-script
- [ ] Fix cloudwatch
- [ ] Fix section of readme that explains the CSV

## Done
- [X] Make parallelization simpler
- [X] Demonstrate voice-id variation tests
- [X] DataDog implementation
- [X] Add sequence support
- [X] Turn batch runner into a class
- [X] Create evaluator class
- [X] Create config.json file? Or env hierarchy?
- [X] Make fields parameterizable using JSON path
- [X] Cleanup readme
- [X] Change to batch message call
- [X] update example.env
