export = Message;
/**
 *
 */
declare class Message {
    /**
     *
     * @param {string} text
     * @returns {Message}
     */
    static fromText(text: string): Message;
    /**
     *
     * @param {string} audio
     * @returns {Message}
     */
    static fromAudioBase64(audio: string): Message;
    /**
     *
     * @param {Buffer} audio
     * @returns {Message}
     */
    static fromAudioBuffer(audio: Buffer): Message;
    /**
     * @type {Audio}
     */
    audio: Audio;
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
import Audio = require("./audio");
