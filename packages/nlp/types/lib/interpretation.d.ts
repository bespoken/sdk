export = Interpretation;
/** @typedef {('LEX' | 'NOOP')} InterpreterType  */
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
    type: InterpreterType;
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
type InterpreterType = ('LEX' | 'NOOP');
import Intent = require("./intent");
import Entity = require("./entity");
