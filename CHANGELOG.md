## 0.4.2
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