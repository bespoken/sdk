/**
 * Analyzers Alexa output for accuracy
 */
export class AlexaAnalyzer {
    /**
     * @param {any} response
     * @param {string} intentName
     * @returns {AnalysisResponse}
     */
    expectedIntent(response: any, intentName: string): AnalysisResponse;
    /**
     * @param {any} response
     * @param {string} intentName
     * @param {string} slotName
     * @param {string} slotValue
     * @returns {AnalysisResponse}
     */
    expectedSlot(response: any, intentName: string, slotName: string, slotValue: string): AnalysisResponse;
    /**
     * Allows for making changes to a result after it has been processed
     * @param {any} response
     * @returns {IntentResponse} True to include the record, false to exclude it
     */
    _decodeResult(response: any): IntentResponse;
    /**
     *
     * @param {string} encodedData
     * @returns {IntentResponse}
     */
    _decodeContent(encodedData: string): IntentResponse;
}
/**
 *
 */
export class AnalysisResponse {
    /**
     *
     * @param {boolean} success
     * @param {string} [advisory]
     */
    constructor(success: boolean, advisory?: string);
    success: boolean;
    advisory: string;
}
/**
 *
 */
declare class IntentResponse {
    /**
     * @param name
     */
    constructor(name: any);
    name: any;
    /** @type {Object<string, SlotResponse>} */
    slots: {
        [x: string]: SlotResponse;
    };
    /**
     * @param name
     * @param transcript
     * @param value
     * @param type
     */
    addSlot(name: any, transcript: any, value: any, type: any): void;
    /**
     *
     * @returns {SlotResponse[]}
     */
    matchedSlots(): SlotResponse[];
    /**
     *
     * @param {string} name
     * @returns {SlotResponse | undefined}
     */
    slot(name: string): SlotResponse | undefined;
}
/**
 *
 */
declare class SlotResponse {
    /**
     *
     * @param {string} name
     * @param {string} transcript
     * @param {string} value
     * @param {string} type
     */
    constructor(name: string, transcript: string, value: string, type: string);
    name: string;
    transcript: string;
    value: string;
    type: string;
}
export {};
