export = Message;
/**
 *
 */
declare class Message extends Persistable {
    /**
     * @param {Conversation} conversation
     * @param {InputSettings} inputSettings
     * @returns {Message}
     */
    static fromAudioStream(conversation: Conversation, inputSettings: InputSettings): Message;
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
     *
     * @param {Conversation} conversation
     * @param {Buffer} buffer
     * @returns {Message}
     */
    static fromBufferAsStream(conversation: Conversation, buffer: Buffer): Message;
    /**
     * @param {any} o
     * @returns {Message}
     */
    static fromJSON(o: any): Message;
    /**
     *
     * @param {Conversation} conversation
     * @param {string} text
     * @param {Message} [originalMessage]
     * @returns {Message}
     */
    static fromText(conversation: Conversation, text: string, originalMessage?: Message): Message;
    /**
     *
     * @param {Conversation} conversation
     * @param {string} dtmfInput
     * @returns {Message}
     */
    static fromDTMF(conversation: Conversation, dtmfInput: string): Message;
    /**
     *
     * @param {Conversation} conversation
     * @returns {Message}
     */
    static emptyMessage(conversation: Conversation): Message;
    /**
     * @param {Conversation} conversation
     * @param {InputSettings} inputSettings
     */
    constructor(conversation: Conversation, inputSettings: InputSettings);
    /** @private */
    private _conversation;
    /** @private @type {Audio | undefined} */
    private _audio;
    /** @private */
    private _locale;
    /** @private @type {string | undefined} */
    private _text;
    /** @private @type {InputSettings} */
    private _inputSettings;
    /** @type {Message | undefined} */
    originalMessage: Message | undefined;
    timedOut: boolean;
    /**
     * @returns {Audio | undefined}
     */
    get audio(): Audio;
    /**
     * @returns {Conversation}
     */
    get conversation(): Conversation;
    /**
     * @returns {InputSettings}
     */
    get inputSettings(): InputSettings;
    /**
     * @returns {string}
     */
    get locale(): string;
    /**
     * @returns {string | undefined}
     */
    get text(): string;
    /**
     * @returns {Audio}
     */
    audioRequired(): Audio;
    /**
     * Clones the message object
     * @returns {Message}
     */
    clone(): Message;
    /**
     * @returns {boolean}
     */
    isEmpty(): boolean;
    /**
     * @returns {any}
     */
    toJSON(): any;
    /**
     * @param {number} [indent]
     * @returns {string}
     */
    toStringAsJSON(indent?: number): string;
}
import Persistable = require("./persistable");
import Audio = require("./audio");
import Conversation = require("./conversation");
import InputSettings = require("./input-settings");
