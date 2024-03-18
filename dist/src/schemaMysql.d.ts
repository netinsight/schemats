import { TableDefinition, Database } from './schemaInterfaces';
import Options from './options';
export declare class MysqlDatabase implements Database {
    connectionString: string;
    private db;
    private defaultSchema;
    constructor(connectionString: string);
    private static mapTableDefinitionToType;
    private static parseMysqlEnumeration;
    private static getEnumNameFromColumn;
    query(queryString: string): Promise<Record<string, any>[]>;
    getEnumTypes(schema?: string): Promise<Record<string, any>>;
    getTableDefinition(tableName: string, tableSchema: string): Promise<TableDefinition>;
    getTableTypes(tableName: string, tableSchema: string, options: Options): Promise<TableDefinition>;
    getSchemaTables(schemaName: string): Promise<string[]>;
    queryAsync(queryString: string, escapedValues?: string[]): Promise<Record<string, any>[]>;
    getDefaultSchema(): string;
}
