export = Audio;
/**
 * Class to handle audio payload
 */
declare class Audio {
    /**
     *
     * @param {Buffer} buffer
     * @param {string} [type='pcm']
     */
    constructor(buffer: Buffer, type?: string);
    buffer: Buffer;
    type: string;
    /**
     * @returns {string}
     */
    base64(): string;
}
