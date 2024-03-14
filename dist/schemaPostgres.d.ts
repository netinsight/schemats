import Options from './options';
import { TableDefinition, Database } from './schemaInterfaces';
export declare class PostgresDatabase implements Database {
    connectionString: string;
    private db;
    constructor(connectionString: string);
    private static mapTableDefinitionToType;
    query(queryString: string): Promise<any>;
    getEnumTypes(schema?: string): Promise<any>;
    getTableDefinition(tableName: string, tableSchema: string): Promise<TableDefinition>;
    getTableTypes(tableName: string, tableSchema: string, options: Options): Promise<TableDefinition>;
    getSchemaTables(schemaName: string): Promise<string[]>;
    getDefaultSchema(): string;
}
