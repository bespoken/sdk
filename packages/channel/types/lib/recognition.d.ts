/**
 *
 */
export class Recognition {
    /**
     * @type {RecognitionResult[]}
     */
    results: RecognitionResult[];
    /**
     *
     * @param {RecognitionResult} result
     * @returns {void}
     */
    addResult(result: RecognitionResult): void;
    /**
     * @returns {RecognitionResult[]}
     */
    sort(): RecognitionResult[];
    /**
     * @returns {RecognitionResult | undefined}
     */
    topResult(): RecognitionResult | undefined;
}
/**
 *
 */
export class RecognitionResult {
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
