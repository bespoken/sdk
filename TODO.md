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
- [X] Get stuff from What3Words
  - [X] Load audio into S3
  - [X] Get the real interaction model
- [ ] Make source/printer more extensible - output only fields, expected field definitions
- [ ] Print out job name regularly
- [ ] Remove 0 points from datadog publishing
- [ ] Identify long-term approach for managing accounts with regular runs
  - [ ] Setup dedicated amazon accounts
  - [ ] Create tokens
  - [ ] Dedicated test skill [optional]
  - [ ] Enable skill for testing
  - [ ] Document accounts - names, passwords, etc.
- [] Fix this bug: ERROR TypeError: Cannot read property 'textField' of null SKIPPING RECORD
      1015 TypeError: Cannot read property 'textField' of null
      1016     at What3WordsInterceptor.interceptResult (/builds/what3words/batch-tester/custom/src/what3words-interceptor.js:41:58)
- [ ] Track errors

## Nice-to-have
- [ ] Merge config and job - get properties of json file from job
- [ ] Use jsdoc on source.js and evaluator
- [ ] update package.json info
- [ ] Add locale support
- [ ] Where to store custom files?
  - [ ] https://stackoverflow.com/questions/53391229/clone-another-gitlab-repository-in-gitlab-ci-script
- [ ] Fix cloudwatch
- [ ] Fix section of readme that explains the CSV
- [ ] Create Junit test reports - to show in gitlab?
- [ ] Look into using AWS gitlab runners? Or via Kubernetes on GCP?

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
- [X] Make skip STT configurable
- [X] Skip unit tests on web runs
