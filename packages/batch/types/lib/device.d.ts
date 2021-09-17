/**
 *
 */
export class Device {
    /**
     * @param token
     * @param skipSTT
     * @param settings
     * @param configuration
     */
    constructor(token: any, skipSTT: boolean, settings: any, configuration: any);
    _token: any;
    _skipSTT: boolean;
    _settings: any;
    _tags: any[];
    _configuration: any;
    /**
     * @param record
     * @param messages
     * @param attempt
     */
    message(record: any, messages: any, attempt?: number): any;
    /**
     * @param error
     * @param messages
     * @param record
     * @param attempt
     */
    _retry(error: any, messages: any, record: any, attempt: any): any;
    /**
     * @param error
     */
    _parseError(error: any): any;
    /**
     * @param tag
     */
    addTag(tag: any): void;
    /**
     * @param tags
     */
    hasTags(tags: any): boolean;
    /**
     * Returns the name of the platform this device corresponds to
     */
    get platform(): string;
    /**
     *
     */
    get settings(): any;
    /**
     *
     */
    get tags(): any[];
    /**
     *
     */
    get token(): any;
}
/**
 *
 */
export class DevicePool {
    /**
     *
     */
    static instance(): any;
    /**
     *
     */
    initialize(): void;
    _devices: any[];
    _devicesInUse: any;
    /**
     * @param record
     */
    lock(record: any): Promise<any>;
    /**
     * @param device
     */
    free(device: any): Promise<void>;
    /**
     * @param record
     */
    _freeDevices(record: any): any[];
    /**
     *
     */
    _freeCount(): number;
    /**
     * @param record
     */
    _validDevices(record: any): any[];
}
