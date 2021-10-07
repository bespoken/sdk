/**
 *
 */
export class Transcription {
    /**
     * @type {TranscriptionResult[]}
     */
    results: TranscriptionResult[];
    /**
     *
     * @param {TranscriptionResult} result
     * @returns {void}
     */
    addResult(result: TranscriptionResult): void;
    /**
     * @returns {TranscriptionResult[]}
     */
    sort(): TranscriptionResult[];
    /**
     * @returns {TranscriptionResult | undefined}
     */
    topResult(): TranscriptionResult | undefined;
}
/**
 *
 */
export class TranscriptionResult {
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
