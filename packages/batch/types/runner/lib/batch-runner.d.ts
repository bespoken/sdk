export = BatchRunner;
/**
 *
 */
declare class BatchRunner {
    /**
     *
     */
    static instance(): any;
    /**
     * @param config
     * @param outputPath
     */
    constructor(config: any, outputPath: any);
    _config: any;
    outputPath: any;
    _startIndex: number;
    /** @type {Job} */
    _job: Job;
    /**
     *
     */
    process(): Promise<void>;
    /**
     *
     */
    _initialize(): Promise<void>;
    _devicePool: any;
    _synchronizer: Synchronizer;
    _metrics: Metrics;
    /**
     * @param device
     * @param record
     */
    _processRecord(device: any, record: any): Promise<void>;
    /**
     * @param device
     * @param record
     * @param retryCount
     */
    _processWithRetries(device: any, record: any, retryCount?: number): Promise<void>;
    /**
     *
     */
    _read(): Promise<void>;
    /**
     *
     */
    _print(): Promise<void>;
    /**
     *
     */
    _saveOnError(): void;
    /**
     * @returns {Job} The job created and processed by this runner
     */
    get job(): Job;
    /**
     *
     */
    set originalJob(arg: any);
    /**
     *
     */
    get originalJob(): any;
    _originalJob: any;
    /**
     *
     */
    get rerun(): boolean;
}
import Job_1 = require("./job");
import Job = Job_1.Job;
import Synchronizer = require("./synchronizer");
import Metrics = require("./metrics");
