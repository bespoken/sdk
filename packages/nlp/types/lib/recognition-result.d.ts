export = RecognitionResult;
/**
 *
 */
declare class RecognitionResult extends Persistable {
    /**
     * @param {any} o
     * @returns {RecognitionResult}
     */
    static fromJSON(o: any): RecognitionResult;
    /**
     *
     * @param {string} text
     * @param {number} confidence
     * @param {number} index
     * @param {any} raw
     *
     */
    constructor(text: string, confidence: number, index: number, raw: any);
    raw: any;
    text: string;
    index: number;
    confidence: number;
    /** @type {string | undefined} */
    textPunctuated: string | undefined;
}
import Persistable = require("./persistable");
