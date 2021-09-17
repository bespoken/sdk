export = MySQLPrinter;
declare class MySQLPrinter extends SQLPrinter {
    connection: any;
    _close(): Promise<any>;
    columnNames: any;
}
import SQLPrinter = require("./sql-printer");
