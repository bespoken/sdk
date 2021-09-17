export = Helper;
declare class Helper {
    /**
     *
     * @param {string} patternToMatch The string to search for
     * @param {string|string[]} textToSearch The string, or array of strings, to search in
     * @param {number} threshold The maximum value of the distance for this to be considered true
     */
    static fuzzyMatch(patternToMatch: string, textToSearch: string | string[], threshold?: number): boolean;
}
