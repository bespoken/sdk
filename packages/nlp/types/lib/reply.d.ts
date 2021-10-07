export = Reply;
/**
 *
 */
declare class Reply extends DTO {
    /**
     *
     * @param {Message} [message]
     */
    constructor(message?: Message);
    message: Message;
    /** @type {Recognition} */
    recognition: Recognition;
    /** @type {Interpretation} */
    interpretation: Interpretation;
    /** @type {string} */
    responseText: string;
    /**
     * @param {string} text
     * @returns {Reply}
     */
    setResponseText(text: string): Reply;
    /**
     * @param {Recognition} value
     * @returns {Reply}
     */
    setRecognition(value: Recognition): Reply;
}
import DTO = require("./dto");
import Message = require("./message");
import Recognition = require("./recognition");
import Interpretation = require("./interpretation");
