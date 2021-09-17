export = SQLPrinter;
/**
 * Sends results of tests to SQLite database
 */
declare class SQLPrinter {
    tableName: string;
    reset(): Promise<any>;
    _connect(): void;
    db: any;
    print(job: any, reset?: boolean): Promise<void>;
    _setup(job: any): Promise<void>;
    fields: any[];
    _query(sql: any): Promise<any>;
    _hasColumn(columnName: any): Promise<any>;
    _prepare(sql: any): Statement;
    _run(sql: any): Promise<any>;
    _addField(fieldName: any, type: any): void;
    _name(fieldName: any): any;
    _value(value: any): any;
}
declare namespace SQLPrinter {
    export { Statement };
}
declare class Statement {
    constructor(printer: any, sql: any);
    printer: any;
    sql: any;
    statement: any;
    run(params: any): Promise<any>;
    finalize(): Promise<any>;
}
