export = Message;
/**
 *
 */
declare class Message extends DTO {
    /**
     *
     * @param {Conversation} conversation
     * @param {string} text
     * @returns {Message}
     */
    static fromText(conversation: Conversation, text: string): Message;
    /**
     * @param {Conversation} conversation
     * @param {string} audio
     * @returns {Message}
     */
    static fromAudioBase64(conversation: Conversation, audio: string): Message;
    /**
     * @param {Conversation} conversation
     * @param {Buffer} audio
     * @returns {Message}
     */
    static fromAudioBuffer(conversation: Conversation, audio: Buffer): Message;
    /**
     * @param {Conversation} conversation
     */
    constructor(conversation: Conversation);
    conversation: Conversation;
    /**
     * @type {Audio}
     */
    audio: Audio;
    locale: string;
    /**
     * @type {string}
     */
    text: string;
    /**
     * Clones the message object
     * @returns {Message}
     */
    clone(): Message;
}
import DTO = require("./dto");
import Conversation = require("./conversation");
import Audio = require("./audio");
