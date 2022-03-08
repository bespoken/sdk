export = Reply;
/**
 *
 */
declare class Reply extends Persistable {
    /**
     * @param {any} o
     * @returns {Reply}
     */
    static fromJSON(o: any): Reply;
    /**
     * @param {Message} message
     * @param {Interpretation} [interpretation]
     */
    constructor(message: Message, interpretation?: Interpretation);
    message: Message;
    /** @type {Interpretation | undefined} */
    interpretation: Interpretation | undefined;
    /** @type {Recognition | undefined} */
    recognition: Recognition | undefined;
    /** @type {string | undefined} */
    text: string | undefined;
    /** @type {Audio | undefined} */
    audio: Audio | undefined;
    /** @type {InputSettings | undefined} */
    inputSettings: InputSettings | undefined;
    /**
     * @returns {boolean}
     */
    hasText(): boolean;
    /**
     * @param {string} s
     * @returns {Reply}
     */
    appendText(s: string): Reply;
    /**
     * @param {Interpretation} interpretation
     * @returns {Reply}
     */
    setInterpretation(interpretation: Interpretation): Reply;
    /**
     * @param {Audio} audio
     * @returns {Reply}
     */
    setAudio(audio: Audio): Reply;
    /**
     * @param {InputSettings} settings
     * @returns {Reply}
     */
    setInputSettings(settings: InputSettings): Reply;
    /**
     * @param {Message} message
     * @returns {Reply}
     */
    setMessage(message: Message): Reply;
    _message: Message;
    /**
     * @param {Recognition} recognition
     * @returns {Reply}
     */
    setRecognition(recognition: Recognition): Reply;
    /**
     * @param {string} text
     * @returns {Reply}
     */
    setText(text: string): Reply;
    /**
     * Strips the opening and closing speak from the text, if present
     * @returns {string | undefined}
     */
    textWithoutSSML(): string | undefined;
}
import Persistable = require("./persistable");
import Message = require("./message");
import Interpretation = require("./interpretation");
import Recognition = require("./recognition");
import Audio = require("./audio");
import InputSettings = require("./input-settings");
