export = InputSettings;
/**
 *
 */
declare class InputSettings {
    /**
     * @param {any} o
     * @returns {InputSettings}
     */
    static fromJSON(o: any): InputSettings;
    /**
     * @param {InputType} type
     */
    constructor(type: InputType);
    type: string;
    /** @type {DialogState} */
    dialogState: DialogState;
    /** @type {string | undefined} */
    intentToConfirm: string | undefined;
    /** @type {number | undefined} */
    maximumDigits: number | undefined;
    /** @type {number | undefined} */
    minimumDigits: number | undefined;
    /** @type {string | undefined} */
    slotToConfirm: string | undefined;
    /** @type {string | undefined} */
    slotToElicit: string | undefined;
    /** @type {number | undefined} */
    timeout: number | undefined;
    /** @type {Object<string, string>} */
    parameters: {
        [x: string]: string;
    };
    /** @type {number | undefined} */
    endSilenceTimeout: number | undefined;
    /**
     *
     * @param {string} key
     * @returns {string | undefined}
     */
    parameter(key: string): string | undefined;
    /**
     * @param {DialogState} state
     * @returns {InputSettings}
     */
    setDialogState(state: DialogState): InputSettings;
    /**
     * @param {number} timeoutInMilliseconds
     * @returns {InputSettings}
     */
    setEndSilenceTimeout(timeoutInMilliseconds: number): InputSettings;
    /**
     * @param {number} digits
     * @returns {InputSettings}
     */
    setMaximumDigits(digits: number): InputSettings;
    /**
     * @param {number} digits
     * @returns {InputSettings}
     */
    setMinimumDigits(digits: number): InputSettings;
    /**
     * @param {string} key
     * @param {string} value
     * @returns {InputSettings}
     */
    setParameter(key: string, value: string): InputSettings;
    /**
     * @param {number} timeout
     * @returns {InputSettings}
     */
    setTimeout(timeout: number): InputSettings;
}
declare namespace InputSettings {
    export { DialogState };
    export { InputType };
}
type DialogState = string;
declare namespace DialogState {
    const CONFIRM_INTENT: string;
    const CONFIRM_SLOT: string;
    const ELICIT_INTENT: string;
    const ELICIT_SLOT: string;
}
type InputType = string;
declare namespace InputType {
    const DTMF: string;
    const EMAIL: string;
    const TEXT: string;
    const VOICE: string;
}
