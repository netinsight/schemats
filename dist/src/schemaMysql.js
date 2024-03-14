"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlDatabase = void 0;
const mysql = __importStar(require("mysql"));
const lodash_1 = require("lodash");
const url_1 = require("url");
class MysqlDatabase {
    constructor(connectionString) {
        this.connectionString = connectionString;
        this.db = mysql.createConnection(connectionString);
        let url = (0, url_1.parse)(connectionString, true);
        if (url && url.pathname) {
            let database = url.pathname.substr(1);
            this.defaultSchema = database;
        }
        else {
            this.defaultSchema = 'public';
        }
    }
    // uses the type mappings from https://github.com/mysqljs/ where sensible
    static mapTableDefinitionToType(tableDefinition, customTypes, options) {
        if (!options)
            throw new Error();
        return (0, lodash_1.mapValues)(tableDefinition, column => {
            switch (column.udtName) {
                case 'char':
                case 'varchar':
                case 'text':
                case 'tinytext':
                case 'mediumtext':
                case 'longtext':
                case 'time':
                case 'geometry':
                case 'set':
                case 'enum':
                    // keep set and enum defaulted to string if custom type not mapped
                    column.tsType = 'string';
                    return column;
                case 'integer':
                case 'int':
                case 'smallint':
                case 'mediumint':
                case 'bigint':
                case 'double':
                case 'decimal':
                case 'numeric':
                case 'float':
                case 'year':
                    column.tsType = 'number';
                    return column;
                case 'tinyint':
                    column.tsType = 'boolean';
                    return column;
                case 'json':
                    column.tsType = 'Object';
                    return column;
                case 'date':
                case 'datetime':
                case 'timestamp':
                    column.tsType = 'Date';
                    return column;
                case 'tinyblob':
                case 'mediumblob':
                case 'longblob':
                case 'blob':
                case 'binary':
                case 'varbinary':
                case 'bit':
                    column.tsType = 'Buffer';
                    return column;
                default:
                    if (customTypes.indexOf(column.udtName) !== -1) {
                        column.tsType = options.transformTypeName(column.udtName);
                        return column;
                    }
                    else {
                        console.log(`Type [${column.udtName}] has been mapped to [any] because no specific type has been found.`);
                        column.tsType = 'any';
                        return column;
                    }
            }
        });
    }
    static parseMysqlEnumeration(mysqlEnum) {
        return mysqlEnum.replace(/(^(enum|set)\('|'\)$)/gi, '').split(`','`);
    }
    static getEnumNameFromColumn(dataType, columnName) {
        return `${dataType}_${columnName}`;
    }
    query(queryString) {
        return this.queryAsync(queryString);
    }
    async getEnumTypes(schema) {
        let enums = {};
        let enumSchemaWhereClause;
        let params;
        if (schema) {
            enumSchemaWhereClause = `and table_schema = ?`;
            params = [schema];
        }
        else {
            enumSchemaWhereClause = '';
            params = [];
        }
        const rawEnumRecords = await this.queryAsync('SELECT column_name, column_type, data_type ' +
            'FROM information_schema.columns ' +
            `WHERE data_type IN ('enum', 'set') ${enumSchemaWhereClause}`, params);
        rawEnumRecords.forEach((enumItem) => {
            const enumName = MysqlDatabase.getEnumNameFromColumn(enumItem.data_type, enumItem.column_name);
            const enumValues = MysqlDatabase.parseMysqlEnumeration(enumItem.column_type);
            if (enums[enumName] && !(0, lodash_1.isEqual)(enums[enumName], enumValues)) {
                const errorMsg = `Multiple enums with the same name and contradicting types were found: ` +
                    `${enumItem.column_name}: ${JSON.stringify(enums[enumName])} and ${JSON.stringify(enumValues)}`;
                throw new Error(errorMsg);
            }
            enums[enumName] = enumValues;
        });
        return enums;
    }
    async getTableDefinition(tableName, tableSchema) {
        let tableDefinition = {};
        const tableColumns = await this.queryAsync('SELECT column_name, data_type, is_nullable ' +
            'FROM information_schema.columns ' +
            'WHERE table_name = ? and table_schema = ?', [tableName, tableSchema]);
        tableColumns.map((schemaItem) => {
            const columnName = schemaItem.column_name;
            const dataType = schemaItem.data_type;
            tableDefinition[columnName] = {
                udtName: /^(enum|set)$/i.test(dataType) ? MysqlDatabase.getEnumNameFromColumn(dataType, columnName) : dataType,
                nullable: schemaItem.is_nullable === 'YES'
            };
        });
        return tableDefinition;
    }
    async getTableTypes(tableName, tableSchema, options) {
        const enumTypes = await this.getEnumTypes(tableSchema);
        let customTypes = (0, lodash_1.keys)(enumTypes);
        return MysqlDatabase.mapTableDefinitionToType(await this.getTableDefinition(tableName, tableSchema), customTypes, options);
    }
    async getSchemaTables(schemaName) {
        const schemaTables = await this.queryAsync('SELECT table_name ' +
            'FROM information_schema.columns ' +
            'WHERE table_schema = ? ' +
            'GROUP BY table_name', [schemaName]);
        return schemaTables.map((schemaItem) => schemaItem.table_name);
    }
    queryAsync(queryString, escapedValues) {
        return new Promise((resolve, reject) => {
            this.db.query(queryString, escapedValues, (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    }
    getDefaultSchema() {
        return this.defaultSchema;
    }
}
exports.MysqlDatabase = MysqlDatabase;
//# sourceMappingURL=schemaMysql.js.map