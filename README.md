# Bespoken Batch Tester
This project enables batch testing of utterances for voice experiences.

It leverages Bespoken's Virtual Devices to run large sets of utterances through Alexa, Google Assistant, and other voice platforms.

## Getting Started
### Installation
To install the Bespoken Batch Tester, just run:  
```
npm install bespoken-batch-tester --save
```

We recommend creating a new project to store artifacts related to the tester, such as the configuration file and the

### Environment Management
We use dotenv when running locally, which takes environment variables from a local `.env` file.

To set this up, just make a copy of `example.env` and name it `.env`. Replace the values inside there with the correct values for your configuration.

For running with continuous integration (such as Jenkins, Circle CI or Gitlab), these values should instead come from actual environment variables.

### Virtual Device Setup
* Create a virtual device with our [easy-to-follow guide here](https://read.bespoken.io/end-to-end/setup/#creating-a-virtual-device).
* Add the newly created token to the `.env` file

If you want to use multiple tokens, just added them as a comma-separated list.

For more information on the best practices for virtual device management, [read our guide here]([docs/ACCOUNT_SETUP.md]).

### Create a Configuration File
Here is a bare minimum configuration file:
```json
{
  "job": "utterance-tester",
  "sequence": ["open my audio player"],
  "source": "csv-source",
  "sourceFile": "path/to/my/file.csv",
  "store": "s3-store"
}
```

To get started, cut and paste those settings into a new file, such as `batch-test.json`.

More information on configuring the batch test is below.

### Running the Tester
Once the configuration file is created, just enter:
```
bbt process batch-test.json
```

And it will be off and running. In practice, we recommend this not be run locally but in a CI environment.

## In-Depth Configuration
The environment variables store sensitive credentials.

Our configuration file stores information particular to how the tests should run, but of a non-sensitive nature.

An example file:
```json
{
  "fields": {
    "imageURL": "$.raw.messageBody.directives[1].payload.content.art.sources[0].url"
  },
  "interceptor": "./src/my-interceptor",
  "job": "utterance-tester",
  "metrics": "datadog-metrics",
  "sequence": ["open my audio player"],
  "source": "csv-source",
  "sourceFile": "path/to/my/file.csv",
  "store": "s3-store"
}
```

Each of the properties is explained below:
### fields
Each field represents a column in the CSV file.

By default, we take these columns and treat them as expected fields in the response output from the Virtual Device.

However, in some cases, these fields are rather complicated. In that case, we can have a field with a simple name, like `imageURL`, but then we specify a JSON path expression which is used to resolve that expression on the response payload.

This way we can perform complex verification on our utterances with a nice, clean CSV file.

### interceptor
The interceptor allows for the core behavior of the batch runner to be modified.

There are two main methods currently:  
* interceptRecord - Called before the record is processed
* interceptResult - Called before the result is finalized

Using [interceptRecord](https://bespoken.gitlab.io/batch-tester/Interceptor.html#interceptRecord), changes can be made to the utterance or the meta data of a record before it is used in a test.

Using [interceptResult](https://bespoken.gitlab.io/batch-tester/Interceptor.html#interceptResult), changes can be made to the result of processing. This can involve:
* Adding tags to the result (for use in metrics displays)
* Changing the `success` flag based on custom validation logic
* Adding output fields to the CSV output to provide additional information to report readers

You can read all about the Interceptor class here:
https://bespoken.gitlab.io/batch-tester/Interceptor.html

### metrics
We have builtin two classes for metrics: `datadog-metrics` and `cloudwatch-metrics`.

This dictates where metrics on the results of the tests are sent.

Additionally, new metric providers can be used by implementing this base class:  
https://bespoken.gitlab.io/batch-tester/Metrics.html

### sequence
For tests in which there are multiple steps required before we do the "official" utterance that is being tested, we can specify them here.

Typically, this would involve launching a skill before saying the specific utterance we want to test, but more complex sequences are possible.

### source
The source for records. Defaults to `csv-source`. Additional builtin option is `s3-source`.

For the `csv-source`, as sourceFile property must also be set.

For the `s3-source`, a sourceBucket must be set. Additionally, AWS credentials must be set in the environment that can access this bucket.

### store
The mechanism used to store the output of the test cases.

Defaults to `s3-store`. To use the s3-store, AWS credentials must be provided that have access to the batch-runner S3 bucket maintained by Bespoken.

Contact Bespoken to have credentials allocated for this, or modify to use your own S3 bucket.

## DataDog Configuration
* Create a DataDog account.
* Take the API key from the Integrations -> API section
* Add it to the `.env` file

## Running utterance resolution tests
These tests check whether or not the utterance names are being understood correctly by Alexa.

To run the CSV-driven tests, enter this command:
```
npm run utterances
```

This will test each utterance defined in the utterances.csv file. The CSV file contains the following fields:

| Column | Description |
| --- | --- |
| utterance | The utterance to be said to Alexa
| expectedResponses | One-to-many expected responses - each one is separated by a comma

For the initial entries, we are typically just looking for the name of the recipe in the response. When the tests are run, here is what will happen:  
> Bespoken Says: `get the recipe for giada chicken piccata`  

>Alexa Replies: `okay for giada chicken piccata I recommend quick chicken piccata 25 minutes to make what would you like start recipe send it to your phone or your next recipe`

This test will pass because the actual response contains the expected response from our CSV file.

## Gitlab Configuration
The gitlab configuration is defined by the file `.gitlab-ci.yml`. The file looks like this:
```yaml
image: node:10

cache:
  paths:
  - node_modules/

stages:
  - test

test:
  stage: test
  script:
   - npm install
   - npm run utterances
  artifacts:
    paths:
    - utterance-results.csv
    expire_in: 1 week
```

This build script runs the utterances and saves of the resulting CSV file.

## Test Reporting
We have setup this project to make use of a few different types of reporting to show off what is possible.

The reporting comes in these forms:
* CSV File that summarizes results of utterance tests
* Reporting via AWS Cloudwatch
* Reporting via DataDog

Each is discussed in more detail below.

### CSV File
The CSV File contains the following output:

| Column | Description |
| --- | --- |
| name | The name of the receipt to ask for
| actualResponse | The actual response back from Alexa
| success | Whether or not the test was successful
| expectedResponses | The possible expected response back from the utterance

### DataDog
DataDog captures metrics related to how all the tests have performed.

The metrics can be easily reported on.

They also can be used to setup notifcations when certain conditions are triggered.

### Creating A Dashboard
DataDog makes it easy to create a Dashboard.

### Creating Alarms
DataDog makes it easy to setup alarms.

## Additional Topics
* Working With Circle CI - TBC
* Working With CloudWatch - TBC
* Working With PagerDuty - TBC
