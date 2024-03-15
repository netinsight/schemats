"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const schemaMysql_1 = require("../../src/schemaMysql");
const options_1 = __importDefault(require("../../src/options"));
describe('MysqlDatabase', () => {
    const mysql = new schemaMysql_1.MysqlDatabase('mysql://user:password@localhost/test');
    beforeEach(() => {
        mysql.db.query = jest.fn((_q, _val, cb) => cb());
    });
    describe('query', () => {
        it('query calls query async', async () => {
            await mysql.query('SELECT * FROM test_table');
            expect(mysql.db.query).toHaveBeenCalledWith('SELECT * FROM test_table', undefined, expect.anything());
        });
    });
    describe('queryAsync', () => {
        it('query has error', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb('ERROR'));
            await expect(mysql.query('SELECT * FROM test_table')).rejects.toEqual('ERROR');
        });
        it('query returns with results', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, []));
            const results = await mysql.query('SELECT * FROM test_table');
            expect(results).toEqual([]);
        });
    });
    describe('getEnumTypes', () => {
        it('writes correct query with schema name', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, []));
            await mysql.getEnumTypes('testschema');
            expect(mysql.db.query).toHaveBeenCalledWith('SELECT column_name, column_type, data_type ' +
                'FROM information_schema.columns ' +
                'WHERE data_type IN (\'enum\', \'set\') and table_schema = ?', ['testschema'], expect.anything());
        });
        it('writes correct query without schema name', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, []));
            await mysql.getEnumTypes();
            expect(mysql.db.query).toHaveBeenCalledWith('SELECT column_name, column_type, data_type ' +
                'FROM information_schema.columns ' +
                'WHERE data_type IN (\'enum\', \'set\') ', [], expect.anything());
        });
        it('handles response', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, [
                { column_name: 'column1', column_type: 'enum(\'enum1\')', data_type: 'enum' },
                { column_name: 'column2', column_type: 'set(\'set1\')', data_type: 'set' }
            ]));
            const enumTypes = await mysql.getEnumTypes('testschema');
            expect(enumTypes).toEqual({
                enum_column1: ['enum1'],
                set_column2: ['set1']
            });
        });
        it('same column same value is accepted', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, [
                { column_name: 'column1', column_type: 'enum(\'enum1\',\'enum2\')', data_type: 'enum' },
                { column_name: 'column1', column_type: 'enum(\'enum1\',\'enum2\')', data_type: 'enum' }
            ]));
            const enumTypes = await mysql.getEnumTypes('testschema');
            expect(enumTypes).toEqual({ enum_column1: ['enum1', 'enum2'] });
        });
        it('same column different value conflict', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, [
                { column_name: 'column1', column_type: 'enum(\'enum1\')', data_type: 'enum' },
                { column_name: 'column1', column_type: 'enum(\'enum2\')', data_type: 'enum' }
            ]));
            await expect(mysql.getEnumTypes('testschema')).rejects.toThrow('Multiple enums with the same name and contradicting types were found: column1: ["enum1"] and ["enum2"]');
        });
    });
    describe('getTableDefinitions', () => {
        it('writes correct query', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, []));
            await mysql.getTableDefinition('testtable', 'testschema');
            expect(mysql.db.query).toHaveBeenCalledWith('SELECT column_name, data_type, is_nullable ' +
                'FROM information_schema.columns ' +
                'WHERE table_name = ? and table_schema = ?', ['testtable', 'testschema'], expect.anything());
        });
        it('handles response', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, [
                { column_name: 'column1', data_type: 'data1', is_nullable: 'NO' },
                { column_name: 'column2', data_type: 'enum', is_nullable: 'YES' },
                { column_name: 'column3', data_type: 'set', is_nullable: 'YES' }
            ]));
            const schemaTables = await mysql.getTableDefinition('testtable', 'testschema');
            expect(schemaTables).toEqual({
                column1: { udtName: 'data1', nullable: false },
                column2: { udtName: 'enum_column2', nullable: true },
                column3: { udtName: 'set_column3', nullable: true }
            });
        });
    });
    describe('getTableTypes', () => {
        const options = new options_1.default({});
        it('gets custom types from enums', async () => {
            const mysql = new schemaMysql_1.MysqlDatabase('mysql://user:password@localhost/test');
            mysql.getEnumTypes = () => Promise.resolve({ enum1: [], enum2: [] });
            mysql.getTableDefinition = () => Promise.resolve({ foo: { udtName: 'enum1', nullable: false } });
            const res = await mysql.getTableTypes('tableName', 'tableSchema', options);
            expect(res).toEqual({
                foo: {
                    udtName: 'enum1',
                    nullable: false,
                    tsType: 'enum1'
                }
            });
        });
        it('gets table definitions', async () => {
            const mysql = new schemaMysql_1.MysqlDatabase('mysql://user:password@localhost/test');
            mysql.getEnumTypes = () => Promise.resolve({});
            mysql.getTableDefinition = () => Promise.resolve({
                table: {
                    udtName: 'name',
                    nullable: false
                }
            });
            const res = await mysql.getTableTypes('tableName', 'tableSchema', options);
            expect(res).toEqual({
                table: {
                    udtName: 'name',
                    nullable: false,
                    tsType: 'any'
                }
            });
        });
    });
    describe('getSchemaTables', () => {
        it('writes correct query', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, []));
            await mysql.getSchemaTables('testschema');
            expect(mysql.db.query).toHaveBeenCalledWith('SELECT table_name ' +
                'FROM information_schema.columns ' +
                'WHERE table_schema = ? ' +
                'GROUP BY table_name', ['testschema'], expect.anything());
        });
        it('handles table response', async () => {
            mysql.db.query = jest.fn((_q, _val, cb) => cb(null, [
                { table_name: 'table1' },
                { table_name: 'table2' }
            ]));
            const schemaTables = await mysql.getSchemaTables('testschema');
            expect(schemaTables).toEqual(['table1', 'table2']);
        });
    });
    describe('mapTableDefinitionToType', () => {
        const mapTableDefinitionToType = schemaMysql_1.MysqlDatabase.mapTableDefinitionToType;
        const options = new options_1.default({});
        describe('maps to string', () => {
            it('char', () => {
                const td = {
                    column: {
                        udtName: 'char',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('varchar', () => {
                const td = {
                    column: {
                        udtName: 'varchar',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('text', () => {
                const td = {
                    column: {
                        udtName: 'text',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('tinytext', () => {
                const td = {
                    column: {
                        udtName: 'tinytext',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('mediumtext', () => {
                const td = {
                    column: {
                        udtName: 'mediumtext',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('longtext', () => {
                const td = {
                    column: {
                        udtName: 'longtext',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('time', () => {
                const td = {
                    column: {
                        udtName: 'time',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('geometry', () => {
                const td = {
                    column: {
                        udtName: 'geometry',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('set', () => {
                const td = {
                    column: {
                        udtName: 'set',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('enum', () => {
                const td = {
                    column: {
                        udtName: 'enum',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
        });
        describe('maps to number', () => {
            it('integer', () => {
                const td = {
                    column: {
                        udtName: 'integer',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('int', () => {
                const td = {
                    column: {
                        udtName: 'int',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('smallint', () => {
                const td = {
                    column: {
                        udtName: 'smallint',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('mediumint', () => {
                const td = {
                    column: {
                        udtName: 'mediumint',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('bigint', () => {
                const td = {
                    column: {
                        udtName: 'bigint',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('double', () => {
                const td = {
                    column: {
                        udtName: 'double',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('decimal', () => {
                const td = {
                    column: {
                        udtName: 'decimal',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('numeric', () => {
                const td = {
                    column: {
                        udtName: 'numeric',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('float', () => {
                const td = {
                    column: {
                        udtName: 'float',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('year', () => {
                const td = {
                    column: {
                        udtName: 'year',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
        });
        describe('maps to boolean', () => {
            it('tinyint', () => {
                const td = {
                    column: {
                        udtName: 'tinyint',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'boolean');
            });
        });
        describe('maps to Object', () => {
            it('json', () => {
                const td = {
                    column: {
                        udtName: 'json',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Object');
            });
        });
        describe('maps to Date', () => {
            it('date', () => {
                const td = {
                    column: {
                        udtName: 'date',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Date');
            });
            it('datetime', () => {
                const td = {
                    column: {
                        udtName: 'datetime',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Date');
            });
            it('timestamp', () => {
                const td = {
                    column: {
                        udtName: 'timestamp',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Date');
            });
        });
        describe('maps to Buffer', () => {
            it('tinyblob', () => {
                const td = {
                    column: {
                        udtName: 'tinyblob',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('mediumblob', () => {
                const td = {
                    column: {
                        udtName: 'mediumblob',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('longblob', () => {
                const td = {
                    column: {
                        udtName: 'longblob',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('blob', () => {
                const td = {
                    column: {
                        udtName: 'blob',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('binary', () => {
                const td = {
                    column: {
                        udtName: 'binary',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('varbinary', () => {
                const td = {
                    column: {
                        udtName: 'varbinary',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('bit', () => {
                const td = {
                    column: {
                        udtName: 'bit',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
        });
        describe('maps to custom', () => {
            it('CustomType', () => {
                const td = {
                    column: {
                        udtName: 'CustomType',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'CustomType');
            });
        });
        describe('maps to any', () => {
            it('UnknownType', () => {
                const td = {
                    column: {
                        udtName: 'UnknownType',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'any');
            });
        });
    });
});
//# sourceMappingURL=schemaMysql.test.js.map