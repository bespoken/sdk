export = Intent;
/**
 * Holds intent data
 */
declare class Intent {
    /**
     *
     * @param {string} name
     * @param {number | undefined} [confidence]
     */
    constructor(name: string, confidence?: number | undefined);
    name: string;
    confidence: number;
    finalized: boolean;
}
