# 0.13.10
* Updated axios across the different packages to remove vulnerabilities

# 0.13.4
## Infrastructure
* Made JSONWrapper class - generic JSON helper utilities for configuration objects

# 0.13.3
## Infrastructure
* Added back docs, updated links to point to GitHub hosted version

# 0.13.0
## New Stuff
* First usable version incorporated into @bespoken-sdk
* Removed support for SQLite
* Updated JSDoc tags throughout project
* Update client-store to use new version bespoken-api-store
* Added timestamp to job and MySQL by default
* Using classes from shared package where appropriate (logger, env, util, etc.)

# 0.12.2
* Working on usable batch package

# 0.12.1
* Updates to collector SDK for better object serialization

# 0.12.0
## **Enhancements**
* First release of collector SDK into real environment

# 0.11.18
## **Enhancements**
* First version of collector SDK

## 0.11.17
### **Enhancements**
* Env requiredVariable now uses a default value if supplied
* Added support for overriding the top result on the recognition object
* Added support dialog state in the input settings

# 0.11.16
## **Enhancements**
* Added reply history to conversation

# 0.10.4
## **Enhancements**
* validate shouldRetry when there is an error

# 0.10.3
## **Enhancements**
* Add ability to send local audio files as utterances for Alexa, Google Assistant and Test Robot
* Change twilio platform to phone platform

# 0.10.2
## **Enhancements**
* Add ability to change backoff time after attempt, defaults to 10
* Add `interceptError` to fill up the result columns if the process has an error
* Use voiceID from source data, defaults to 'en-US-Wavenet-D'
## **Bug Fixes**
* Fix output path name extension bug

# 0.10.1
## **Enhancements**
* Use locale from source data, defaults to 'en-US'
* Use voiceID from source data, defaults to 'en-US-Wavenet-D'

# 0.10
## **Enhancements**
* `interceptRequest` now accepts a `Record` object as a first argument. This is a breaking change.

# 0.9.20
## **Enhancements**
* Send notification emails after job is done

# 0.9.19
## **Enhancements**
* Get locale and voiceID from virtualDeviceConfig

# 0.9.18
## **Enhancements**
* Use voiceID from record by default
* Add ability to change the locale, by default is en-US

# 0.9.17
## **Enhancements**
* Enhancements on docs and behavior for fuzzyMatch

# 0.9.16
## **Bug Fixes**
* Changed cache behavior so that it does NOT clone objects

# 0.9.15
## **Bug Fixes**
* Add memory and CPU to avoid crashes on server

# 0.9.14
## **Enhancements**
* Add shouldRetry property to Result class to retry a record using the interceptResult method

# 0.9.13
* Add `fuzzyMatch` to search a string in an array of phrases
* Add `sanitizedOcrLines` property to `Result` class

# 0.9.12
## **Bug Fixes**
* Fix issue with loading data on reprocess

# 0.9.11
## **Enhancements**
* Better support for reprint
* SQL printer can now override table name with MYSQL_TABLE environment variable
* Clean up boolean values in SQL printer

# 0.9.10
## **Bug Fixes**
* More fixes to prevent oversaving of data

# 0.9.9
## **Bug Fixes**
* Fix oversaving of data on reruns when there is an error
## **Enhancements**
* Better progress info on file downloads

# 0.9.8
## **Bug Fixes**
* Forced pino to use 6.3.x version as we see weird `originalMsg` output in logs
## **Enhancements**
* Created Metabase ECS service

# 0.9.7
## **Enhancements**
*  The limit of virtual devices can be set in an env variable `VIRTUAL_DEVICE_LIMIT`. If present, it takes the first "n" devices from the config file, otherwise it will use all of them.

# 0.9.6
## **Bug Fixes**
* Fix for improperly outputting results.csv file (file was being created as undefined.csv by default)
* Fix for improper error-handling when the configuration file is not set propertly

## **Enhancements**
* Added outputFields property to record, so outputFields can be defined in the source classes

# 0.9.5
## **Enhancements**
* Added support for printing to MySQL by default if environment variables are set
* Only printing at the end of runs as opposed to with each record

# 0.9.2
## **Enhancements**
* Added support for MySQL
* Added support for list command - lists jobs that match run name

# 0.9.0
## **Enhancements**
* **IMPORTANT** Using streams to fetch and store S3 files - all clients must upgrade once server is deployed
* Removed lastResponse instance variable (still preserved get property though)
* Added SQLite printer for printing output to SQLite database
* Added `rerun` flag to records as convenience method for simpler code in interceptors
* Added `reprocessAll` capability for rerunning multiple jobs based on filters

# 0.8.25
## **Enhancements**
* The limit of records can be set in an env variable `LIMIT`. If present, tt takes priority over the config file.

# 0.8.24
## **Enhancements**
* Increase CPU for batch-tester server to 512

# 0.8.23
## **Enhancements**
* Adds the option to save the logs to a `batch-tester.log` file on the output folder by setting the `SAVE_LOG_FILE` env variable. It uses pino default format.

# 0.8.22
## **Enhancements**
* Adds a conversationId getter and setter to the record object. 

# 0.8.21
## **Enhancements**
* Prevent saving of data on re-runs

# 0.8.20
## **Enhancements**
* Implements pino.js for logging. Default log level is set to 'info', except for the server where it's still 'debug'.

# 0.8.19
## **Enhancements**
* Removes several console.logs calls

# 0.8.18
## **Enhancements**
* Removes request log to reduce clutter

# 0.8.17
## **Enhancements**
* Adds maxAttempts to the config

# 0.8.16
## **Enhancements**
* Adds the conversation id to the timeout messages

# 0.8.15
## **Enhancements**
* Intercept request now has the device as a parameter

# 0.8.14
## **Enhancements**
* Saves all the results from a response in the record object

# 0.8.13
## **Enhancements**
* Added conversationId to the lastResponse object

# 0.8.12
## **Enhancements**
* Added timestamp to each result record

# 0.8.11
## **Enhancements**
* Added request interceptor

# 0.8.10
## **Enhancements**
* Added timeouts to get results from virtual device 

# 0.8.9
## **Enhancements**
* Added batch runner instance for saving job after errors
## **Bug Fixes**
* Fixed RAW DATA URL column values with batch job key for `reprocess` and `reprint` commands

# 0.8.8
## **Enhancements**
* Added `date` property to the Job object. This stores the UTC date in which the job was created in ISO-8691. Eg.: `2020-05-21T18:59:55Z`. The job name is also created with UTC. Eg. `job_name_2020-05-21T18-59-55`

# 0.8.7
## **Enhancements**
* Added the methods `interceptPreProcess` and  `interceptPostProcess` to add custom code before and after a batch tester execution. For `interceptPreProcess` the user has to be careful if resuming a job.

# 0.8.6
## **Enhancements**
* Added the `Synchronizer` class for saving the batch job depending on the `saveInterval` property from the configuration file, it is set to 300 seconds by default.

# 0.8.5
## **Enhancements**
* Adds the `virtualDeviceConfig` property on the configuration json. This allows sending parameters that will be used on all virtual devices.
* Allows for using Twilio virtual devices with text utterances or prerecorded audio. The last ones can only be passed as URLs.

# 0.8.4
## **Bug Fixes**
* Allow the tag property on a virtual device to be undefined

# 0.8.0
## **Enhancements**
* **IMPORTANT** Added compression on fetching files - to avoid timeouts when dealing with very large runs
  * Requires upgrading to new version of batch-tester client to interact with server
  * Fetch is used by the reprocess, rerun and resume commands
* Added compression on saving files - to reduce file size and improve transfer speed

# 0.7.2
## **Enhancements**
* Added merge feature - described [here](README.md#merge-csv-results)
* Added --output_file flag - described [here](README.md#select-output-file)
* Improved our command-line interface using commander

# 0.7.1
## **Enhancements**
* Handled multiple matches when JSON path expression returns multiple values
* Added support for output only fields to test definitions

## **Bug Fixes**
* Fixed rerunner command, it was calling source file

# 0.7.0
## **Enhancements**
* **IMPORTANT** Added `settings` property on virtualDevices - [read here](README.md#virtual-device-setup) - the previous virtualDevices that took an array of tags will still work but have been deprecated
* Added builtin `device` column to csv-source. Automatically filters for devices that match the tag specified in this column, if present
* Added `sequential` mode to force records to be processed one-by-one - [read about it here](README.md#sequential)
* Switched to using async endpoint for virtual devices
* Added improved formatting on log messages

## **Bug Fixes**
* Better error-handling when an error is returned from the Virtual Device service

# 0.6.3
## **Enhancements**
* Convenience methods for accessing outputFields and actualFields on the result object

## **Bug Fixes**
* Fixed issue with configuration values that are booleans which have a default value

# 0.6.2
## **Enhancements**
* Added the `rerunner` - allows for reprocessing previous jobs - [read here](README.md#re-processing-a-job)
* Automatically adds a tag to every result for the platform used by the device ('amazon-alexa' and 'google-assistant' for now)
* **IMPORTANT** Automatically add output fields to tags - no need to define both output field and tag

## **Bug Fixes**
* Increased max-file-size allowed to be sent by bespoken-store

# 0.6.1
## **Enhancements**
* Print out log URL to console after each record is processed

# 0.6.0
## **Enhancements**
* Added bespoken-store - new and improved persistent results storage!
  * **IMPORTANT:** file-store and s3-store are now deprecated. Existing projects should remove the `store` key from the input json. The runner will just default to bespoken-store from now on.
  * **IMPORTANT:** No need to set AWS keys in environment variables - these should be removed in existing projects
  * **IMPORTANT:** Resuming jobs now takes a RUN_KEY as opposed to RUN_NAME
  * Added link to detailed logs in CSV results - look at raw input and output directly

# 0.5.0
## **Enhancements**
* Automatically publish expected and actual field values to DataDog - **NOTE** this may be redundant with existing tags

## **Bug Fixes**
* Handles errors on interceptRecord gracefully - shows the full message and does not stop processing

# 0.4.4
## **Enhancements**
* Implemented limit feature in configuration file. Now it is possible to run just some utterances for testing purposes.

## **Bug Fixes**
* Added Node.js version requirements to package.json and README

# 0.4.3
## **Enhancements**
* Better documentation on DataDog chart creation

## **Bug Fixes**
* More work to ensure module resolution works well - very tough issue to replicate

# 0.4.2
## **Enhancements**
* Added reprint feature - described [here](README.md#csv-file). Allows for retrieving CSV results after the run is completed.

## **Bug Fixes**
* Fixed issue with module resolution identified with [Node V12 and greater](https://github.com/nodejs/node/issues/27583)

# 0.4.1
## **Enhancements**
* Default location for CSV input files is now used - `input/records.csv`
* For DataDog metrics, publish a 0 for what did NOT happen (failure, success and error) - this makes math easier in the reports (as otherwise we have N/As, which cannot be using formulas)

# 0.4.0
## **Breaking changes**
* Tokens are now kept in the config file - property: `virtualDevices`. See [README](README.md#virtual-device-setup).
* virtualDeviceBaseURL is now set in the config file - property: `virtualDeviceBaseURL`. Defaults to `https://virtual-device.bespoken.io`.
* All output files are now kept in the /output directory - such as /output/results.csv.
* Reporting uses new `customer` property for the configuration file - this is a REQUIRED field

## **Enhancements**
* Ability to tag tokens to restrict processing of records to certain tokens - [read more](README.md#virtual-device-setup)

# 0.3.0
TO BE FILLED IN
