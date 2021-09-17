/**
 * Abstract class that defines contract for record sources
 */
export class Source {
    /**
     * Gets the source singleton
     * @returns {Source}
     */
    static instance(): Source;
    /**
     * Filters records based on configuration
     * The filters are set in the config as a key and set of values, such as:
     * ```
     * filters: {
     *   property: ['value1', 'value2'],
     * }
     * ```
     * The property is taken from the `meta` attribute of the record
     * @param {Record[]} records
     * @returns {Record[]} The records after the filter is applied
     */
    filter(records: Record[]): Record[];
    /**
     * Loads all records - this function must be implemented by subclasses
     * @returns {Promise<Record[]>} The records to be processed
     */
    loadAll(): Promise<Record[]>;
    /**
     * Called just before the record is processed - for last minute operations
     * @param {Record} record
     * @returns {Promise<void>}
     */
    loadRecord(record: Record): Promise<void>;
}
/**
 * Individual records to be processed
 */
export class Record {
    /**
     * @param o
     */
    static fromJSON(o: any): Record;
    /**
     * Creates a record
     * @param {string} utterance The utterance to be sent to the voice experience being tested
     * @param {Object.<string, string>} [expectedFields = {}] The expected values for the record
     * @param {Object} [meta] Additional info about the record to be used in processing
     */
    constructor(utterance: string, expectedFields?: {
        [x: string]: string;
    }, meta?: any);
    _utterance: string;
    _utteranceRaw: string;
    _expectedFields: {
        [x: string]: string;
    };
    _outputFields: {};
    _meta: any;
    _deviceTags: any[];
    _conversationId: any;
    _locale: string;
    _voiceID: string;
    _rerun: boolean;
    /** @type {Object<string, any>} */
    _settings: {
        [x: string]: any;
    };
    /**
     * Device tags indicate that a record can ONLY be run on a device with this tag
     * @param {string} tag
     */
    addDeviceTag(tag: string): void;
    /**
     * Adds an expected field to the record
     * @param {string} name
     * @param {string} value
     */
    addExpectedField(name: string, value: string): void;
    /**
     * Adds an output field to the record
     * @param {string} name
     * @param {string} value
     */
    addOutputField(name: string, value: string): void;
    /**
     *
     * @param {string} name
     * @param {string} setting
     */
    addSetting(name: string, setting: string): void;
    /**
     * @param name
     */
    outputField(name: any): any;
    /**
     *
     */
    set conversationId(arg: any);
    /**
     * Property to get the latest conversation id while processing the record
     * @type {Object}
     */
    get conversationId(): any;
    /**
     * Gets the device tags associated with this record
     */
    get deviceTags(): any[];
    /**
     * The expected values for the record
     * @type {Object.<string, string>}
     */
    get expectedFields(): {
        [x: string]: string;
    };
    /**
     * @private
     */
    set locale(arg: string);
    /**
     * Getter and setter for the locale
     * @type {string}
     */
    get locale(): string;
    /**
     *
     */
    set meta(arg: any);
    /**
     * Property for additional info to be set on the record
     * @type {Object}
     */
    get meta(): any;
    /**
     * The output field values for the record - gets combinted with the outputfields on the result
     * @type {Object.<string, string>}
     */
    get outputFields(): {
        [x: string]: string;
    };
    /**
     *
     */
    set rerun(arg: boolean);
    /**
     * Whether this record is being rerun
     * @type {boolean}
     */
    get rerun(): boolean;
    /**
     * @returns {Object<string, any>}
     */
    get settings(): {
        [x: string]: any;
    };
    /**
     * The original utterance
     * @type {string}
     */
    get utteranceRaw(): string;
    /**
     * @private
     */
    set utterance(arg: string);
    /**
     * Getter and setter for the utterance
     * @type {string}
     */
    get utterance(): string;
    /**
       * @private
       */
    set voiceID(arg: string);
    /**
     * Getter and setter for the utterance
     * @type {string}
     */
    get voiceID(): string;
}
