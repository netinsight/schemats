import Options from './options';
export interface ColumnDefinition {
    udtName: string;
    nullable: boolean;
    tsType?: string;
}
export type TableDefinition = Record<string, ColumnDefinition>;
export interface Database {
    connectionString: string;
    query(queryString: string): Promise<Record<string, any>[]>;
    getDefaultSchema(): string;
    getEnumTypes(schema?: string): any;
    getTableDefinition(tableName: string, tableSchema: string): Promise<TableDefinition>;
    getTableTypes(tableName: string, tableSchema: string, options: Options): Promise<TableDefinition>;
    getSchemaTables(schemaName: string): Promise<string[]>;
}
