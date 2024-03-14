"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresDatabase = void 0;
const pg_promise_1 = __importDefault(require("pg-promise"));
const lodash_1 = require("lodash");
const lodash_2 = require("lodash");
const pgp = (0, pg_promise_1.default)();
class PostgresDatabase {
    constructor(connectionString) {
        this.connectionString = connectionString;
        this.db = pgp(connectionString);
    }
    static mapTableDefinitionToType(tableDefinition, customTypes, options) {
        return (0, lodash_1.mapValues)(tableDefinition, column => {
            switch (column.udtName) {
                case 'bpchar':
                case 'char':
                case 'varchar':
                case 'text':
                case 'citext':
                case 'uuid':
                case 'bytea':
                case 'inet':
                case 'time':
                case 'timetz':
                case 'interval':
                case 'name':
                    column.tsType = 'string';
                    return column;
                case 'int2':
                case 'int4':
                case 'float4':
                case 'float8':
                case 'numeric':
                case 'money':
                case 'oid':
                    column.tsType = 'number';
                    return column;
                case 'int8':
                    column.tsType = 'bigint';
                    return column;
                case 'bool':
                    column.tsType = 'boolean';
                    return column;
                case 'json':
                case 'jsonb':
                    column.tsType = 'Object';
                    return column;
                case 'date':
                case 'timestamp':
                case 'timestamptz':
                    column.tsType = 'Date';
                    return column;
                case '_int2':
                case '_int4':
                case '_float4':
                case '_float8':
                case '_numeric':
                case '_money':
                    column.tsType = 'Array<number>';
                    return column;
                case '_int8':
                    column.tsType = 'Array<bigint>';
                    return column;
                case '_bool':
                    column.tsType = 'Array<boolean>';
                    return column;
                case '_varchar':
                case '_text':
                case '_citext':
                case '_uuid':
                case '_bytea':
                    column.tsType = 'Array<string>';
                    return column;
                case '_json':
                case '_jsonb':
                    column.tsType = 'Array<Object>';
                    return column;
                case '_timestamptz':
                    column.tsType = 'Array<Date>';
                    return column;
                default:
                    if (customTypes.indexOf(column.udtName) !== -1) {
                        column.tsType = options.transformTypeName(column.udtName);
                        return column;
                    }
                    else {
                        console.log(`Type [${column.udtName} has been mapped to [any] because no specific type has been found.`);
                        column.tsType = 'any';
                        return column;
                    }
            }
        });
    }
    query(queryString) {
        return this.db.query(queryString);
    }
    async getEnumTypes(schema) {
        let enums = {};
        let enumSchemaWhereClause = schema ? pgp.as.format(`where n.nspname = $1`, schema) : '';
        await this.db.each('select n.nspname as schema, t.typname as name, e.enumlabel as value ' +
            'from pg_type t ' +
            'join pg_enum e on t.oid = e.enumtypid ' +
            'join pg_catalog.pg_namespace n ON n.oid = t.typnamespace ' +
            `${enumSchemaWhereClause} ` +
            'order by t.typname asc, e.enumlabel asc;', [], (item) => {
            if (!enums[item.name]) {
                enums[item.name] = [];
            }
            enums[item.name].push(item.value);
        });
        return enums;
    }
    async getTableDefinition(tableName, tableSchema) {
        let tableDefinition = {};
        await this.db.each('SELECT column_name, udt_name, is_nullable ' +
            'FROM information_schema.columns ' +
            'WHERE table_name = $1 and table_schema = $2', [tableName, tableSchema], (schemaItem) => {
            tableDefinition[schemaItem.column_name] = {
                udtName: schemaItem.udt_name,
                nullable: schemaItem.is_nullable === 'YES'
            };
        });
        return tableDefinition;
    }
    async getTableTypes(tableName, tableSchema, options) {
        let enumTypes = await this.getEnumTypes();
        let customTypes = (0, lodash_2.keys)(enumTypes);
        return PostgresDatabase.mapTableDefinitionToType(await this.getTableDefinition(tableName, tableSchema), customTypes, options);
    }
    async getSchemaTables(schemaName) {
        return await this.db.map('SELECT table_name ' +
            'FROM information_schema.columns ' +
            'WHERE table_schema = $1 ' +
            'GROUP BY table_name ' +
            'ORDER BY table_name', [schemaName], (schemaItem) => schemaItem.table_name);
    }
    getDefaultSchema() {
        return 'public';
    }
}
exports.PostgresDatabase = PostgresDatabase;
//# sourceMappingURL=schemaPostgres.js.map