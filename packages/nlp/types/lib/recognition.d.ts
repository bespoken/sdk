export = Recognition;
/** @typedef {('AZURE' | 'NOOP' )} RecognizerType  */
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
    type: RecognizerType;
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
type RecognizerType = ('AZURE' | 'NOOP');
import RecognitionResult = require("./recognition-result");
