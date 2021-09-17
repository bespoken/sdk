export = Interceptor;
/**
 * The interceptor is responsible for allowing customization of the batch runner behavior
 */
declare class Interceptor {
    /**
     *
     */
    static instance(): any;
    /**
     * Allows for the input record to be manipulated before being processed
     * @param {Record} record
     * @returns {Promise<boolean>} True to include the record, false to exclude it
     */
    interceptRecord(record: Record): Promise<boolean>;
    /**
     * Allows for making changes to a result after it has been processed
     * @param {Record} record
     * @param {Result} result
     * @returns {Promise<boolean>} True to include the record, false to exclude it
     */
    interceptResult(record: Record, result: Result): Promise<boolean>;
    /**
     * Allows for making changes to a result after it has an error
     * @param {Record} record
     * @returns {Promise<Undefined>} Void promise
     */
    interceptError(record: Record): Promise<undefined>;
    /**
     * Allows for calling custom code before the execution of the tests begin
     * @param {Job} job
     * @returns {Promise<Undefined>} Void promise
     */
    interceptPreProcess(job: any): Promise<undefined>;
    /**
     * Allows for making changes to a result after it has been processed
     * @param {Job} job
     * @returns {Promise<Undefined>} Void promise
     */
    interceptPostProcess(job: any): Promise<undefined>;
    /**
     * Allows for making changes to a request payload
     * @param {Record} the record associated with this request
     * @param record
     * @param {Object} request payload
     * @param {Device} the device making the request
     * @param device
     * @returns {Promise<Undefined>} Void promise
     */
    interceptRequest(record: any, request: any, device: any): Promise<undefined>;
}
import Record_1 = require("./source");
import Record = Record_1.Record;
import Result_1 = require("./job");
import Result = Result_1.Result;
