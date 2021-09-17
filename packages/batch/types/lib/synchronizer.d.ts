export = Synchronizer;
/**
 *
 */
declare class Synchronizer {
    /**
     * @param job
     */
    constructor(job: any);
    job: any;
    interval: number;
    periodicSave: NodeJS.Timer;
    /**
     * @param logMessage
     */
    saveJob(logMessage: any): Promise<void>;
    /**
     *
     */
    runSave(): void;
    /**
     *
     */
    stopSave(): void;
}
