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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const sinon = __importStar(require("sinon"));
const mysql_1 = __importDefault(require("mysql"));
const schemaMysql_1 = require("../../src/schemaMysql");
const options_1 = __importDefault(require("../../src/options"));
const options = new options_1.default({});
const MysqlDBReflection = schemaMysql_1.MysqlDatabase;
describe('MysqlDatabase', () => {
    let db;
    const sandbox = sinon.sandbox.create();
    before(() => {
        sandbox.stub(mysql_1.default, 'createConnection');
        sandbox.stub(MysqlDBReflection.prototype, 'queryAsync');
        db = new schemaMysql_1.MysqlDatabase('mysql://user:password@localhost/test');
    });
    beforeEach(() => {
        sandbox.reset();
    });
    after(() => {
        sandbox.restore();
    });
    describe('query', () => {
        it('query calls query async', async () => {
            await db.query('SELECT * FROM test_table');
            node_assert_1.default.deepEqual(MysqlDBReflection.prototype.queryAsync.getCall(0).args, ['SELECT * FROM test_table']);
        });
    });
    describe('queryAsync', () => {
        before(() => {
            MysqlDBReflection.prototype.queryAsync.restore();
        });
        after(() => {
            sandbox.stub(MysqlDBReflection.prototype, 'queryAsync');
        });
        it('query has error', async () => {
            mysql_1.default.createConnection.returns({
                query: function query(queryString, params, cb) {
                    cb('ERROR');
                }
            });
            const testDb = new schemaMysql_1.MysqlDatabase('mysql://user:password@localhost/test');
            try {
                await testDb.query('SELECT * FROM test_table');
            }
            catch (e) {
                node_assert_1.default.equal(e, 'ERROR');
            }
        });
        it('query returns with results', async () => {
            mysql_1.default.createConnection.returns({
                query: function query(queryString, params, cb) {
                    cb(null, []);
                }
            });
            const testDb = new schemaMysql_1.MysqlDatabase('mysql://user:password@localhost/test');
            const results = await testDb.query('SELECT * FROM test_table');
            node_assert_1.default.deepEqual(results, []);
        });
    });
    describe('getEnumTypes', () => {
        it('writes correct query with schema name', async () => {
            MysqlDBReflection.prototype.queryAsync.returns(Promise.resolve([]));
            await db.getEnumTypes('testschema');
            node_assert_1.default.deepEqual(MysqlDBReflection.prototype.queryAsync.getCall(0).args, [
                'SELECT column_name, column_type, data_type ' +
                    'FROM information_schema.columns ' +
                    'WHERE data_type IN (\'enum\', \'set\') and table_schema = ?',
                ['testschema']
            ]);
        });
        it('writes correct query without schema name', async () => {
            MysqlDBReflection.prototype.queryAsync.returns(Promise.resolve([]));
            await db.getEnumTypes();
            node_assert_1.default.deepEqual(MysqlDBReflection.prototype.queryAsync.getCall(0).args, [
                'SELECT column_name, column_type, data_type ' +
                    'FROM information_schema.columns ' +
                    'WHERE data_type IN (\'enum\', \'set\') ',
                []
            ]);
        });
        it('handles response', async () => {
            MysqlDBReflection.prototype.queryAsync.returns(Promise.resolve([
                { column_name: 'column1', column_type: 'enum(\'enum1\')', data_type: 'enum' },
                { column_name: 'column2', column_type: 'set(\'set1\')', data_type: 'set' }
            ]));
            const enumTypes = await db.getEnumTypes('testschema');
            node_assert_1.default.deepEqual(enumTypes, {
                enum_column1: ['enum1'],
                set_column2: ['set1']
            });
        });
        it('same column same value is accepted', async () => {
            MysqlDBReflection.prototype.queryAsync.returns(Promise.resolve([
                { column_name: 'column1', column_type: 'enum(\'enum1\',\'enum2\')', data_type: 'enum' },
                { column_name: 'column1', column_type: 'enum(\'enum1\',\'enum2\')', data_type: 'enum' }
            ]));
            const enumTypes = await db.getEnumTypes('testschema');
            node_assert_1.default.deepEqual(enumTypes, {
                enum_column1: ['enum1', 'enum2']
            });
        });
        it('same column different value conflict', async () => {
            MysqlDBReflection.prototype.queryAsync.returns(Promise.resolve([
                { column_name: 'column1', column_type: 'enum(\'enum1\')', data_type: 'enum' },
                { column_name: 'column1', column_type: 'enum(\'enum2\')', data_type: 'enum' }
            ]));
            try {
                await db.getEnumTypes('testschema');
            }
            catch (e) {
                node_assert_1.default.equal(e.message, 'Multiple enums with the same name and contradicting types were found: column1: ["enum1"] and ["enum2"]');
            }
        });
    });
    describe('getTableDefinitions', () => {
        it('writes correct query', async () => {
            MysqlDBReflection.prototype.queryAsync.returns(Promise.resolve([]));
            await db.getTableDefinition('testtable', 'testschema');
            node_assert_1.default.deepEqual(MysqlDBReflection.prototype.queryAsync.getCall(0).args, [
                'SELECT column_name, data_type, is_nullable ' +
                    'FROM information_schema.columns ' +
                    'WHERE table_name = ? and table_schema = ?',
                ['testtable', 'testschema']
            ]);
        });
        it('handles response', async () => {
            MysqlDBReflection.prototype.queryAsync.returns(Promise.resolve([
                { column_name: 'column1', data_type: 'data1', is_nullable: 'NO' },
                { column_name: 'column2', data_type: 'enum', is_nullable: 'YES' },
                { column_name: 'column3', data_type: 'set', is_nullable: 'YES' }
            ]));
            const schemaTables = await db.getTableDefinition('testtable', 'testschema');
            node_assert_1.default.deepEqual(schemaTables, {
                column1: { udtName: 'data1', nullable: false },
                column2: { udtName: 'enum_column2', nullable: true },
                column3: { udtName: 'set_column3', nullable: true }
            });
        });
    });
    describe('getTableTypes', () => {
        const tableTypesSandbox = sinon.sandbox.create();
        before(() => {
            tableTypesSandbox.stub(MysqlDBReflection.prototype, 'getEnumTypes');
            tableTypesSandbox.stub(MysqlDBReflection.prototype, 'getTableDefinition');
            tableTypesSandbox.stub(MysqlDBReflection, 'mapTableDefinitionToType');
        });
        beforeEach(() => {
            tableTypesSandbox.reset();
        });
        after(() => {
            tableTypesSandbox.restore();
        });
        it('gets custom types from enums', async () => {
            MysqlDBReflection.prototype.getEnumTypes.returns(Promise.resolve({ enum1: [], enum2: [] }));
            MysqlDBReflection.prototype.getTableDefinition.returns(Promise.resolve({}));
            await db.getTableTypes('tableName', 'tableSchema', options);
            node_assert_1.default.deepEqual(MysqlDBReflection.mapTableDefinitionToType.getCall(0).args[1], ['enum1', 'enum2']);
        });
        it('gets table definitions', async () => {
            MysqlDBReflection.prototype.getEnumTypes.returns(Promise.resolve({}));
            MysqlDBReflection.prototype.getTableDefinition.returns(Promise.resolve({ table: {
                    udtName: 'name',
                    nullable: false
                } }));
            await db.getTableTypes('tableName', 'tableSchema', options);
            node_assert_1.default.deepEqual(MysqlDBReflection.prototype.getTableDefinition.getCall(0).args, ['tableName', 'tableSchema']);
            node_assert_1.default.deepEqual(MysqlDBReflection.mapTableDefinitionToType.getCall(0).args[0], { table: {
                    udtName: 'name',
                    nullable: false
                } });
        });
    });
    describe('getSchemaTables', () => {
        it('writes correct query', async () => {
            MysqlDBReflection.prototype.queryAsync.returns(Promise.resolve([]));
            await db.getSchemaTables('testschema');
            node_assert_1.default.deepEqual(MysqlDBReflection.prototype.queryAsync.getCall(0).args, [
                'SELECT table_name ' +
                    'FROM information_schema.columns ' +
                    'WHERE table_schema = ? ' +
                    'GROUP BY table_name',
                ['testschema']
            ]);
        });
        it('handles table response', async () => {
            MysqlDBReflection.prototype.queryAsync.returns(Promise.resolve([
                { table_name: 'table1' },
                { table_name: 'table2' }
            ]));
            const schemaTables = await db.getSchemaTables('testschema');
            node_assert_1.default.deepEqual(schemaTables, ['table1', 'table2']);
        });
    });
    describe('mapTableDefinitionToType', () => {
        describe('maps to string', () => {
            it('char', () => {
                const td = {
                    column: {
                        udtName: 'char',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('varchar', () => {
                const td = {
                    column: {
                        udtName: 'varchar',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('text', () => {
                const td = {
                    column: {
                        udtName: 'text',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('tinytext', () => {
                const td = {
                    column: {
                        udtName: 'tinytext',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('mediumtext', () => {
                const td = {
                    column: {
                        udtName: 'mediumtext',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('longtext', () => {
                const td = {
                    column: {
                        udtName: 'longtext',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('time', () => {
                const td = {
                    column: {
                        udtName: 'time',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('geometry', () => {
                const td = {
                    column: {
                        udtName: 'geometry',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('set', () => {
                const td = {
                    column: {
                        udtName: 'set',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('enum', () => {
                const td = {
                    column: {
                        udtName: 'enum',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'string');
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
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('int', () => {
                const td = {
                    column: {
                        udtName: 'int',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('smallint', () => {
                const td = {
                    column: {
                        udtName: 'smallint',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('mediumint', () => {
                const td = {
                    column: {
                        udtName: 'mediumint',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('bigint', () => {
                const td = {
                    column: {
                        udtName: 'bigint',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('double', () => {
                const td = {
                    column: {
                        udtName: 'double',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('decimal', () => {
                const td = {
                    column: {
                        udtName: 'decimal',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('numeric', () => {
                const td = {
                    column: {
                        udtName: 'numeric',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('float', () => {
                const td = {
                    column: {
                        udtName: 'float',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('year', () => {
                const td = {
                    column: {
                        udtName: 'year',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'number');
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
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'boolean');
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
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Object');
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
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Date');
            });
            it('datetime', () => {
                const td = {
                    column: {
                        udtName: 'datetime',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Date');
            });
            it('timestamp', () => {
                const td = {
                    column: {
                        udtName: 'timestamp',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Date');
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
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('mediumblob', () => {
                const td = {
                    column: {
                        udtName: 'mediumblob',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('longblob', () => {
                const td = {
                    column: {
                        udtName: 'longblob',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('blob', () => {
                const td = {
                    column: {
                        udtName: 'blob',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('binary', () => {
                const td = {
                    column: {
                        udtName: 'binary',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('varbinary', () => {
                const td = {
                    column: {
                        udtName: 'varbinary',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
            });
            it('bit', () => {
                const td = {
                    column: {
                        udtName: 'bit',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, [], options).column.tsType, 'Buffer');
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
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'CustomType');
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
                node_assert_1.default.equal(MysqlDBReflection.mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'any');
            });
        });
    });
});
//# sourceMappingURL=schemaMysql.test.js.map