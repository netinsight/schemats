/**
 * Schemats takes sql database schema and creates corresponding typescript definitions
 * Created by xiamx on 2016-08-10.
 */
import { TableValidator } from './typescript';
import { Database } from './schema';
import Options, { OptionValues } from './options';
export declare function typescriptOfTable(db: Database | string, table: string, schema: string, options?: Options): Promise<{
    interfaces: string;
    validator: TableValidator;
}>;
export declare function validatorToString(validator: TableValidator): string;
export declare function typescriptOfSchema(db: Database | string, tables?: string[], schema?: string | null, options?: OptionValues): Promise<string>;
export { Database, getDatabase } from './schema';
export { Options, OptionValues };
