export = AlexaAnalyzer;
declare class AlexaAnalyzer {
    expectedIntent(result: any, intentName: any): AnalysisResponse;
    expectedSlot(result: any, intentName: any, slotName: any, slotValue: any): AnalysisResponse;
    /**
     * Allows for making changes to a result after it has been processed
     * @param {Result} result
     * @returns {IntentResponse} True to include the record, false to exclude it
     */
    _decodeResult(result: any): IntentResponse;
    /**
     *
     * @param {string} encodedData
     * @returns {IntentResponse}
     */
    _decodeContent(encodedData: string): IntentResponse;
}
declare class AnalysisResponse {
    /**
     *
     * @param {boolean} success
     * @param {string} [advisory]
     */
    constructor(success: boolean, advisory?: string);
    success: boolean;
    advisory: string;
}
declare class IntentResponse {
    constructor(name: any);
    name: any;
    /** @type {Object<string, SlotResponse>} */
    slots: {
        [x: string]: SlotResponse;
    };
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
