export = Entity;
/**
 * Holds entity object
 */
declare class Entity {
    /**
     * @param {string} name
     * @param {string} value
     * @param {string} transcription
     * @param {number} [confidence]
     */
    constructor(name: string, value: string, transcription: string, confidence?: number);
    name: string;
    value: string;
    transcription: string;
    confidence: number;
}
