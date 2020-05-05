## 0.7.1
### **Enhancements**
* Handled multiple matches when JSON path expression returns multiple values
* Added support for output only fields to test definitions

### **Bug Fixes**
* Fixed rerunner command, it was calling source file

## 0.7.0
### **Enhancements**
* **IMPORTANT** Added `settings` property on virtualDevices - [read here](README.md#virtual-device-setup) - the previous virtualDevices that took an array of tags will still work but have been deprecated
* Added builtin `device` column to csv-source. Automatically filters for devices that match the tag specified in this column, if present
* Added `sequential` mode to force records to be processed one-by-one - [read about it here](README.md#sequential)
* Switched to using async endpoint for virtual devices
* Added improved formatting on log messages

### **Bug Fixes**
* Better error-handling when an error is returned from the Virtual Device service

## 0.6.3
### **Enhancements**
* Convenience methods for accessing outputFields and actualFields on the result object

### **Bug Fixes**
* Fixed issue with configuration values that are booleans which have a default value

## 0.6.2
### **Enhancements**
* Added the `rerunner` - allows for reprocessing previous jobs - [read here](README.md#re-processing-a-job)
* Automatically adds a tag to every result for the platform used by the device ('amazon-alexa' and 'google-assistant' for now)
* **IMPORTANT** Automatically add output fields to tags - no need to define both output field and tag

### **Bug Fixes**
* Increased max-file-size allowed to be sent by bespoken-store

## 0.6.1
### **Enhancements**
* Print out log URL to console after each record is processed

## 0.6.0
### **Enhancements**
* Added bespoken-store - new and improved persistent results storage!
  * **IMPORTANT:** file-store and s3-store are now deprecated. Existing projects should remove the `store` key from the input json. The runner will just default to bespoken-store from now on.
  * **IMPORTANT:** No need to set AWS keys in environment variables - these should be removed in existing projects
  * **IMPORTANT:** Resuming jobs now takes a RUN_KEY as opposed to RUN_NAME
  * Added link to detailed logs in CSV results - look at raw input and output directly

## 0.5.0
### **Enhancements**
* Automatically publish expected and actual field values to DataDog - **NOTE** this may be redundant with existing tags

### **Bug Fixes**
* Handles errors on interceptRecord gracefully - shows the full message and does not stop processing

## 0.4.4
### **Enhancements**
* Implemented limit feature in configuration file. Now it is possible to run just some utterances for testing purposes.

### **Bug Fixes**
* Added Node.js version requirements to package.json and README

## 0.4.3
### **Enhancements**
* Better documentation on DataDog chart creation

### **Bug Fixes**
* More work to ensure module resolution works well - very tough issue to replicate

## 0.4.2
### **Enhancements**
* Added reprint feature - described [here](README.md#csv-file). Allows for retrieving CSV results after the run is completed.

### **Bug Fixes**
* Fixed issue with module resolution identified with [Node V12 and greater](https://github.com/nodejs/node/issues/27583)

## 0.4.1
### **Enhancements**
* Default location for CSV input files is now used - `input/records.csv`
* For DataDog metrics, publish a 0 for what did NOT happen (failure, success and error) - this makes math easier in the reports (as otherwise we have N/As, which cannot be using formulas)

## 0.4.0
### **Breaking changes**
* Tokens are now kept in the config file - property: `virtualDevices`. See [README](README.md#virtual-device-setup).
* virtualDeviceBaseURL is now set in the config file - property: `virtualDeviceBaseURL`. Defaults to `https://virtual-device.bespoken.io`.
* All output files are now kept in the /output directory - such as /output/results.csv.
* Reporting uses new `customer` property for the configuration file - this is a REQUIRED field

### **Enhancements**
* Ability to tag tokens to restrict processing of records to certain tokens - [read more](README.md#virtual-device-setup)

## 0.3.0
TO BE FILLED IN
