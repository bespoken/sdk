## Critical
- [X] Figure out how to hide variables in gitlab - should be writeonly
  - [X] Update what3words AWS keys
- [X] Make module loading less painful - resolve relative to CWD?
- [X] Final publishing
  - [X] Rename to batch-framework
  - [X] Publish as actual npm package
- [ ] Change default bucket policy to exclude listobejct

## Important
- [X] More documentation
  - [X] More jsdocs - metrics, store
  - [X] Update README
  - [X] Figure out hosting of docs
- [X] Move access of virtual-device-token env variable to initialize block so not required for testing
- [X] Identify long-term approach for managing accounts with regular runs
  - [X] Setup dedicated amazon accounts
  - [X] Create tokens
  - [X] Dedicated test skill [optional]
  - [X] Enable skill for testing
  - [X] Document accounts - names, passwords, etc.
- [X] Create an npm package
- [X] Add codecov

## Nice-to-have
- [ ] Merge config and job - get properties of json file from job
- [ ] Add locale support
- [X] Fix cloudwatch
- [X] Look into using AWS gitlab runners? Or via Kubernetes on GCP?

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
- [X] Add source interface
- [X] Add filter
  - [X] On source
  - [X] On results
- [X] Add http support
- [X] Concatenate audio
- [X] Update datadog key
- [X] Save as we go along
  - [X] Allow for resume
  - [X] Label each job uniquely
- [X] Get stuff from What3Words
  - [X] Load audio into S3
  - [X] Get the real interaction model
- [X] Make source/printer more extensible - output only fields, expected field definitions
- [X] Print out job name regularly
- [X] Remove 0 points from datadog publishing
- [X] Fix this bug: ERROR TypeError: Cannot read property 'textField' of null SKIPPING RECORD
      1015 TypeError: Cannot read property 'textField' of null
      1016     at What3WordsInterceptor.interceptResult (/builds/what3words/batch-tester/custom/src/what3words-interceptor.js:41:58)
- [X] Add more unit-tests
  - [X] Enable code coverage in Gitlab
- [X] Make job into _job
