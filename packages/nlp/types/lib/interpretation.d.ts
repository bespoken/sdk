export = Interpretation;
/** @typedef {('LEX')} InterpreterType  */
/**
 * Holds results from NLU
 */
declare class Interpretation {
    /**
     *
     * @param {Message} message
     * @param {any} raw
     * @param {InterpreterType} type
     * @param {Intent} [intent]
     */
    constructor(message: Message, raw: any, type: InterpreterType, intent?: Intent);
    message: Message;
    raw: any;
    type: "LEX";
    intent: Intent;
    /** @type {Entity[]} */
    entities: Entity[];
    /**
     *
     * @param {Entity} entity
     * @returns {Interpretation}
     */
    addEntity(entity: Entity): Interpretation;
}
declare namespace Interpretation {
    export { InterpreterType };
}
import Message = require("./message");
import Intent = require("./intent");
import Entity = require("./entity");
type InterpreterType = ('LEX');
