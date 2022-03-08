export = Interpretation;
/** @typedef {('LEX' | 'NOOP' | 'VOICEFLOW')} InterpreterType  */
/**
 * Holds results from NLU
 */
declare class Interpretation extends Persistable {
    /**
     * @param {any} o
     * @returns {Interpretation | undefined}
     */
    static fromJSON(o: any): Interpretation | undefined;
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
    /** @type {Recognition | undefined} */
    recognition: Recognition | undefined;
    /** @type {Entity[]} */
    entities: Entity[];
    /**
     *
     * @param {Entity} entity
     * @returns {Interpretation}
     */
    addEntity(entity: Entity): Interpretation;
    /**
     *
     * @param {string} name
     * @returns {Entity | undefined}
     */
    entity(name: string): Entity | undefined;
    /**
     * @param {Recognition} recognition
     * @returns {Interpretation}
     */
    setRecognition(recognition: Recognition): Interpretation;
    /**
     * @param {string} property
     * @returns {any}
     */
    toJSON(property: string): any;
}
declare namespace Interpretation {
    export { InterpreterType };
}
import Persistable = require("./persistable");
import Message = require("./message");
type InterpreterType = ('LEX' | 'NOOP' | 'VOICEFLOW');
import Intent = require("./intent");
import Recognition = require("./recognition");
import Entity = require("./entity");
