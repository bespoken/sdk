export = Conversation;
/** @typedef {('DIRECT' | 'TELNYX' | 'TWILIO')} ChannelType */
/**
 * Manages the conversation between a user and a bot
 */
declare class Conversation extends Persistable {
    /**
     * @param {any} o
     * @returns {Conversation}
     */
    static fromJSON(o: any): Conversation;
    /**
     * @param {any} raw
     * @param {ChannelType} channelType
     * @param {string} externalID
     */
    constructor(raw: any, channelType: ChannelType, externalID: string);
    raw: any;
    channelType: ChannelType;
    externalID: string;
    /** @type {Object<string, any>} */
    context: {
        [x: string]: any;
    };
    /** @type {string | undefined} */
    phoneNumber: string | undefined;
    /** @type {Reply[]} */
    replies: Reply[];
    /**
     * @param {Reply} reply
     * @returns {Conversation}
     */
    addReply(reply: Reply): Conversation;
    /**
    * @param {string} key
    * @returns {string | undefined}
    */
    contextString(key: string): string | undefined;
    /**
     * @param {string} key
     * @returns {any | undefined}
     */
    contextValue(key: string): any | undefined;
    /**
     * @returns {Reply | undefined}
     */
    lastReply(): Reply | undefined;
    /**
     * @returns {any}
     */
    toJSON(): any;
}
declare namespace Conversation {
    export { Reply, ChannelType };
}
import Persistable = require("./persistable");
type ChannelType = ('DIRECT' | 'TELNYX' | 'TWILIO');
type Reply = import('./reply');
