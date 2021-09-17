/**
 * Class that manages info and execution of a particular job
 */
export class Job {
    /**
     * This routine loads a Job
     * It checks first for it locally - if it's not there, it loads it remotely
     * It then saves it locally for faster access
     * @param {string} key
     */
    static lazyFetchJobForKey(key: string): Promise<Job>;
    /**
     * Creates a new Job object from JSON
     * @param {Object} json
     * @returns {Job}
     */
    static fromJSON(json: any): Job;
    /**
     * @param name
     * @param run
     * @param config
     */
    constructor(name: any, run: any, config: any);
    _name: any;
    _run: any;
    _date: string;
    _config: any;
    _key: any;
    _records: any[];
    _results: any[];
    _processedCount: number;
    totalCount: number;
    _rerun: boolean;
    /**
     * Captures a result of a record being processed
     * @param {Result} result
     */
    addResult(result: Result): void;
    /**
     * Increments the number of records being processed
     * @param {number} [count] Defaults to 1
     */
    addProcessedCount(count?: number): void;
    /**
     * Iterates across all the results to see all the expected field values
     * @returns {string[]} Return the list of expected field names
     */
    expectedFieldNames(): string[];
    /**
     *
     */
    outputFieldNames(): any[];
    /**
     * @param recordArray
     * @param resultProperty
     */
    _uniqueFields(recordArray: any, resultProperty: any): any[];
    /**
     *
     */
    get config(): any;
    /**
     *
     */
    get customer(): any;
    /**
     *
     */
    set key(arg: any);
    /**
     *
     */
    get key(): any;
    /**
     *
     */
    get name(): any;
    /**
     *
     */
    get processedCount(): number;
    /**
     *
     */
    set records(arg: Record[]);
    /**
     * @returns {Record[]} The records for the job
     */
    get records(): Record[];
    /**
     *
     */
    set rerun(arg: boolean);
    /**
     *
     */
    get rerun(): boolean;
    /**
     * @returns {Result[]} The results for the job
     */
    get results(): Result[];
    /**
     *
     */
    set run(arg: string);
    /**
     * The run name
     * @type {string}
     */
    get run(): string;
    /**
     *
     */
    get status(): "COMPLETED" | "NOT_COMPLETED";
    /**
     * The date the job was created (UTC)
     * Saved in ISO 8601 format: YYYY-MM-DDThh:mm:ssZ
     * Eg. 2020-05-21T15:50:13Z
     * @type {string}
     */
    get date(): string;
}
/**
 * The result for a particular record
 */
export class Result {
    /**
     *
     * @param {Record} record
     * @param {string} [voiceId]
     * @param {Object[]} responses
     * @param {number} retryCount
     */
    constructor(record: Record, voiceId?: string, responses: any[], retryCount?: number);
    _record: Record;
    _voiceId: string;
    _responses: any[];
    _actualFields: {};
    _outputFields: {};
    _tags: {};
    _timestamp: number;
    _shouldRetry: boolean;
    _retryCount: number;
    /**
     *
     * @param {string} field
     * @returns {string} The value for the field
     */
    actualField(field: string): string;
    /**
     * Adds the actual value for an expected field to the result
     * @param {string} field The name of the field
     * @param {string} value The value of the field
     */
    addActualField(field: string, value: string): void;
    /**
     * Adds a field to the output results - these are fields that are not expected or actual but are helpful info about the record
     * @param {string} field The name of the field
     * @param {string} value The value of the field
     */
    addOutputField(field: string, value: string): void;
    /**
     * @param key
     * @param value
     */
    addTag(key: any, value: any): void;
    /**
     * Gets a specific output field
     * @param {string} field
     * @returns {string} The value of the field
     */
    outputField(field: string): string;
    /**
     *
     */
    get actualFields(): {};
    /**
     *
     */
    set error(arg: any);
    /**
     *
     */
    get error(): any;
    _error: any;
    /**
     *
     */
    get lastResponse(): any;
    /**
     *
     */
    get responses(): any[];
    /**
     *
     */
    get outputFields(): {};
    /**
     *
     */
    get record(): Record;
    /**
     *
     */
    get sanitizedOcrLines(): any;
    /**
     *
     */
    set success(arg: boolean);
    /**
     * @type {boolean}
     */
    get success(): boolean;
    _success: boolean;
    /**
     *
     */
    get tags(): {};
    /**
     *
     */
    get timestamp(): number;
    /**
     *
     */
    set shouldRetry(arg: boolean);
    /**
     *
     */
    get shouldRetry(): boolean;
    /**
     *
     */
    set retryCount(arg: number);
    /**
     *
     */
    get retryCount(): number;
}
import Record_1 = require("./source");
import Record = Record_1.Record;
