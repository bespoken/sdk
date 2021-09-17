export = Metrics;
/**
 * Defines the interface for publishing metrics to data/reporting tools
 */
declare class Metrics {
    /**
     * @returns {Metrics}
     */
    static instance(): Metrics;
    /**
     * Called to initialize the metrics client
     * @param job
     * @params {Job} job The job the metrics client is publishing data for
     * @returns {Promise<void>}
     */
    initialize(job: any): Promise<void>;
    /**
     * Called to publish data about a specific result.
     * Must be implemented by sub-classes.
     * @param {Job} job
     * @param {Result} result
     * @returns {Promise<void>}
     */
    publish(job: Job, result: Result): Promise<void>;
}
import Job_1 = require("./job");
import Job = Job_1.Job;
import Result_1 = require("./job");
import Result = Result_1.Result;
