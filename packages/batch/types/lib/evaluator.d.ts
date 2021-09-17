export = Evaluator;
/**
 * The evaluator class encapsulates logic to determine if a particular record passed its tests
 */
declare class Evaluator {
    /**
     * Runs through all the fields defined in the CSV record and compares them to actual
     * @param {Record} record
     * @param {Result} result
     * @param {Object} response
     */
    static evaluate(record: Record, result: Result, response: any): Result;
    /**
     * @param field
     * @param record
     * @param response
     */
    static evaluateExpectedField(field: any, record: any, response: any): {
        actual: string;
        expected: any;
        success: boolean;
    };
    /**
     * @param field
     * @param response
     */
    static jsonQuery(field: any, response: any): any[];
}
import Record_1 = require("./source");
import Record = Record_1.Record;
import Result_1 = require("./job");
import Result = Result_1.Result;
