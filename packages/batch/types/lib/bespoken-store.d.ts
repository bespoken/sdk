export = BespokenStore;
declare class BespokenStore extends Store {
    filter(runName: any, limit?: number): Promise<any>;
    decrypt(key: any): Promise<any>;
}
import Store = require("./store");
