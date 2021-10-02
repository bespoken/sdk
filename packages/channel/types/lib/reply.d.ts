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
    /** @type {Transcription} */
    transcription: typeof Transcription;
    /** @type {Understanding} */
    understanding: Understanding;
    /** @type {string} */
    responseText: string;
    /**
     * @param {string} text
     * @returns {Reply}
     */
    setResponseText(text: string): Reply;
    /**
     * @param {Transcription} value
     * @returns {Reply}
     */
    setTranscription(value: typeof Transcription): Reply;
}
import DTO = require("./dto");
import Message = require("./message");
import Transcription = require("./recognition");
import Understanding = require("./understanding");
