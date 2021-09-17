export = Store;
/**
 * Interface for storing data
 */
declare class Store {
    /**
     * @returns Store}
     */
    static instance(): any;
    /**
     * @param run
     */
    static key(run: any): any;
    /**
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * If the store provides hosted access, the base URL
     * Defaults to undefined
     * @returns {string} The base URL for accessing stored data
     */
    accessURL(): string;
    /**
     *
     * @param {Job} job
     * @param {number} index
     * @returns {string}
     */
    logURL(job: Job, index: number): string;
    /**
     * Fetches the run by name
     * @param {string} run
     * @returns {Job}
     */
    fetch(run: string): Job;
    /**
     *
     * @param {Object} job
     * @returns {string} key
     */
    save(job: any): string;
    /**
     *
     */
    get job(): any;
    /**
     *
     */
    get run(): any;
}
import Job_1 = require("./job");
import Job = Job_1.Job;
