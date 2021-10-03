export = Recognition;
/** @typedef {('AZURE')} RecognizerType  */
/**
 *
 */
declare class Recognition extends DTO {
    /**
     *
     * @param {Message} message
     * @param {any} raw
     * @param {RecognizerType} type
     */
    constructor(message: Message, raw: any, type: RecognizerType);
    message: Message;
    raw: any;
    type: "AZURE";
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
declare namespace Recognition {
    export { RecognizerType };
}
import DTO = require("./dto");
import Message = require("./message");
import RecognitionResult = require("./recognition-result");
type RecognizerType = ('AZURE');
