export = Printer;
/**
 * The printer class is responsible for outputting results in a human-readable format
 * The default implementation creates a CSV file
 */
declare class Printer {
    /**
     * @param outputPath
     * @returns {Printer}
     */
    static instance(outputPath: any): Printer;
    /**
     * @param outputPath
     */
    constructor(outputPath?: string);
    outputPath: string;
    /**
     * Prints out the results for a job
     * @param {Job} job
     */
    print(job: any): Promise<any>;
}
