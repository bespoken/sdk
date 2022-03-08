export = Recognition;
/**
 *
 */
declare class Recognition {
    /**
     *
     * @param {any} o
     * @returns {Recognition}
     */
    static fromJSON(o: any): Recognition;
    /**
     *
     * @param {Message} message
     * @param {any} raw
     * @param {string} type
     */
    constructor(message: Message, raw: any, type: string);
    message: Message;
    raw: any;
    type: string;
    /**
     * @type {RecognitionResult[]}
     */
    results: RecognitionResult[];
    timedOut: boolean;
    /** @type {RecognitionResult | undefined} */
    _topResult: RecognitionResult | undefined;
    /**
     *
     * @param {RecognitionResult} result
     * @returns {void}
     */
    addResult(result: RecognitionResult): void;
    /**
     * @param {boolean} timedOut
     * @returns {Recognition}
     */
    setTimedOut(timedOut: boolean): Recognition;
    /**
     * @returns {RecognitionResult[]}
     */
    sort(): RecognitionResult[];
    /**
     * We can override the top result
     * @param {RecognitionResult} result
     * @returns {Recognition}
     */
    setTopResult(result: RecognitionResult): Recognition;
    /**
     * @returns {RecognitionResult | undefined}
     */
    topResult(): RecognitionResult | undefined;
}
import Message = require("./message");
import RecognitionResult = require("./recognition-result");
