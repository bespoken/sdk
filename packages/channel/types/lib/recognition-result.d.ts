export = RecognitionResult;
/**
 *
 */
declare class RecognitionResult {
    /**
     *
     * @param {string} text
     * @param {number} confidence
     * @param {any} raw
     *
     */
    constructor(text: string, confidence: number, raw: any);
    raw: any;
    text: string;
    confidence: number;
    /** @type {string} */
    textPunctuated: string;
}
