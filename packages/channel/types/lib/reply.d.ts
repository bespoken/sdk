export = Reply;
/**
 *
 */
declare class Reply {
    /**
     *
     * @param {Message} message
     * @param {Transcription} transcription
     * @param {Understanding} understanding
     */
    constructor(message: Message, transcription: typeof Transcription, understanding: Understanding);
    message: Message;
    transcription: typeof Transcription;
    understanding: Understanding;
}
import Message = require("./message");
import Transcription = require("./transcription");
import Understanding = require("./understanding");
