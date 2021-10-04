export = Intent;
/**
 * Holds intent data
 */
declare class Intent {
    /**
     *
     * @param {string} name
     * @param {number} confidence
     */
    constructor(name: string, confidence: number);
    name: string;
    confidence: number;
}
