export = Audio;
/**
 * Class to handle audio payload
 */
declare class Audio extends Persistable {
    /**
     * @param {any} o
     * @returns {Audio}
     */
    static fromJSON(o: any): Audio;
    /**
     *
     * @param {Buffer} [buffer]
     * @param {string} [type='pcm']
     */
    constructor(buffer?: Buffer, type?: string);
    /** @private */
    private _buffer;
    type: string;
    sampleRate: number;
    bitsPerSample: number;
    channels: number;
    _streamBuffer: Buffer;
    _stream: any;
    /**
     * @returns {string | undefined}
     */
    base64(): string | undefined;
    /**
     * @returns {Buffer}
     */
    buffer(): Buffer;
    /**
     * @returns {void}
     */
    close(): void;
    /**
     * @returns {number}
     */
    durationInSeconds(): number;
    /**
     * @returns {boolean}
     */
    isStream(): boolean;
    /**
     * @returns {number | undefined}
     */
    length(): number | undefined;
    /**
     * @param {Buffer} buffer
     * @returns {void}
     */
    push(buffer: Buffer): void;
    /**
     * @param {(8 | 16 | 32)} bitsPerSample
     * @returns {Audio}
     */
    setBitsPerSample(bitsPerSample: (8 | 16 | 32)): Audio;
    /**
     * @param {(1 | 2)} channels
     * @returns {Audio}
     */
    setChannels(channels: (1 | 2)): Audio;
    /**
     * @param {(8000 | 16000)} sampleRate
     * @returns {Audio}
     */
    setSampleRate(sampleRate: (8000 | 16000)): Audio;
    /**
     * @returns {Readable | undefined}
     */
    stream(): Readable | undefined;
    /**
     * @returns {Readable}
     */
    streamRequired(): Readable;
    /**
     * @returns {any}
     */
    toJSON(): any;
}
import Persistable = require("./persistable");
import Readable_1 = require("stream");
import Readable = Readable_1.Readable;
