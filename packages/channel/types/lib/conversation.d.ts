export = Conversation;
/** @typedef {('TWILIO')} ChannelType */
/**
 * Manages the conversation between a user and a bot
 */
declare class Conversation extends DTO {
    /**
     * @param {any} raw
     * @param {ChannelType} channelType
     * @param {string} externalID
     */
    constructor(raw: any, channelType: ChannelType, externalID: string);
    raw: any;
    channelType: "TWILIO";
    externalID: string;
    /** @type {string} */
    phoneNumber: string;
}
declare namespace Conversation {
    export { ChannelType };
}
import DTO = require("./dto");
type ChannelType = ('TWILIO');
