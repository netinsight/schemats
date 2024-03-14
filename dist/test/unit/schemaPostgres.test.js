"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const schemaPostgres_1 = require("../../src/schemaPostgres");
const options_1 = __importDefault(require("../../src/options"));
describe('PostgresDatabase', () => {
    const pg = new schemaPostgres_1.PostgresDatabase('something');
    beforeEach(() => {
        pg.db = {
            query: jest.fn(),
            each: jest.fn(),
            map: jest.fn()
        };
    });
    describe('query', () => {
        it('calls postgres query', async () => {
            pg.db = { query: jest.fn() };
            await pg.query('SELECT * FROM TEST');
            expect(pg.db.query).toHaveBeenCalledWith('SELECT * FROM TEST');
        });
    });
    describe('getEnumTypes', () => {
        it('writes correct query with schema name', async () => {
            await pg.getEnumTypes('schemaName');
            expect(pg.db.each).toHaveBeenCalledWith('select n.nspname as schema, t.typname as name, e.enumlabel as value ' +
                'from pg_type t join pg_enum e on t.oid = e.enumtypid ' +
                'join pg_catalog.pg_namespace n ON n.oid = t.typnamespace ' +
                'where n.nspname = \'schemaName\' ' +
                'order by t.typname asc, e.enumlabel asc;', [], expect.anything());
        });
        it('writes correct query without schema name', async () => {
            await pg.getEnumTypes();
            expect(pg.db.each).toHaveBeenCalledWith('select n.nspname as schema, t.typname as name, e.enumlabel as value ' +
                'from pg_type t join pg_enum e on t.oid = e.enumtypid ' +
                'join pg_catalog.pg_namespace n ON n.oid = t.typnamespace  ' +
                'order by t.typname asc, e.enumlabel asc;', [], expect.anything());
        });
        it('handles response from db', async () => {
            let enums = await pg.getEnumTypes();
            const callback = pg.db.each.mock.calls[0][2];
            const dbResponse = [
                { name: 'name', value: 'value1' },
                { name: 'name', value: 'value2' }
            ];
            dbResponse.forEach(callback);
            node_assert_1.default.deepEqual(enums, { name: ['value1', 'value2'] });
        });
    });
    describe('getTableDefinition', () => {
        it('writes correct query', async () => {
            await pg.getTableDefinition('tableName', 'schemaName');
            expect(pg.db.each).toHaveBeenCalledWith('SELECT column_name, udt_name, is_nullable ' +
                'FROM information_schema.columns ' +
                'WHERE table_name = $1 and table_schema = $2', ['tableName', 'schemaName'], expect.anything());
        });
        it('handles response from db', async () => {
            let tableDefinition = await pg.getTableDefinition('tableName', 'schemaName');
            const callback = pg.db.each.mock.calls[0][2];
            const dbResponse = [
                { column_name: 'col1', udt_name: 'int2', is_nullable: 'YES' },
                { column_name: 'col2', udt_name: 'text', is_nullable: 'NO' }
            ];
            dbResponse.forEach(callback);
            node_assert_1.default.deepEqual(tableDefinition, {
                col1: { udtName: 'int2', nullable: true },
                col2: { udtName: 'text', nullable: false }
            });
        });
    });
    describe('getTableTypes', () => {
        it('gets custom types from enums', async () => {
            const pg = new schemaPostgres_1.PostgresDatabase('something');
            pg.getEnumTypes = () => Promise.resolve({ enum1: [], enum2: [] });
            pg.getTableDefinition = () => Promise.resolve({ foo: { udtName: 'enum1', nullable: false } });
            const res = await pg.getTableTypes('tableName', 'tableSchema', new options_1.default({}));
            expect(res).toEqual({
                foo: {
                    udtName: 'enum1',
                    nullable: false,
                    tsType: 'enum1'
                }
            });
        });
        it('gets table definitions', async () => {
            const pg = new schemaPostgres_1.PostgresDatabase('something');
            pg.getEnumTypes = () => Promise.resolve({});
            pg.getTableDefinition = () => Promise.resolve({
                table: {
                    udtName: 'name',
                    nullable: false
                }
            });
            const res = await pg.getTableTypes('tableName', 'tableSchema', new options_1.default({}));
            expect(res).toEqual({
                table: {
                    udtName: 'name',
                    nullable: false,
                    tsType: 'string'
                }
            });
        });
    });
    describe('getSchemaTables', () => {
        it('writes correct query', async () => {
            await pg.getSchemaTables('schemaName');
            expect(pg.db.map).toHaveBeenCalledWith('SELECT table_name ' +
                'FROM information_schema.columns ' +
                'WHERE table_schema = $1 ' +
                'GROUP BY table_name ' +
                'ORDER BY table_name', ['schemaName'], expect.anything());
        });
        it('handles response from db', async () => {
            await pg.getSchemaTables('schemaName');
            const callback = pg.db.map.mock.calls[0][2];
            const dbResponse = [
                { table_name: 'table1' },
                { table_name: 'table2' }
            ];
            const schemaTables = dbResponse.map(callback);
            node_assert_1.default.deepEqual(schemaTables, ['table1', 'table2']);
        });
    });
    describe('mapTableDefinitionToType', () => {
        const mapTableDefinitionToType = schemaPostgres_1.PostgresDatabase.mapTableDefinitionToType;
        const options = new options_1.default({});
        describe('maps to string', () => {
            it('bpchar', () => {
                const td = {
                    column: {
                        udtName: 'bpchar',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
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
            it('citext', () => {
                const td = {
                    column: {
                        udtName: 'citext',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('uuid', () => {
                const td = {
                    column: {
                        udtName: 'uuid',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('bytea', () => {
                const td = {
                    column: {
                        udtName: 'bytea',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('inet', () => {
                const td = {
                    column: {
                        udtName: 'inet',
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
            it('timetz', () => {
                const td = {
                    column: {
                        udtName: 'timetz',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('interval', () => {
                const td = {
                    column: {
                        udtName: 'interval',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
            it('name', () => {
                const td = {
                    column: {
                        udtName: 'name',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'string');
            });
        });
        describe('maps to number', () => {
            it('int2', () => {
                const td = {
                    column: {
                        udtName: 'int2',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('int4', () => {
                const td = {
                    column: {
                        udtName: 'int4',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it.skip('int8', () => {
                const td = {
                    column: {
                        udtName: 'int8',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('float4', () => {
                const td = {
                    column: {
                        udtName: 'float4',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('float8', () => {
                const td = {
                    column: {
                        udtName: 'float8',
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
            it('money', () => {
                const td = {
                    column: {
                        udtName: 'money',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
            it('oid', () => {
                const td = {
                    column: {
                        udtName: 'oid',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'number');
            });
        });
        describe('maps to boolean', () => {
            it('bool', () => {
                const td = {
                    column: {
                        udtName: 'bool',
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
            it('jsonb', () => {
                const td = {
                    column: {
                        udtName: 'jsonb',
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
            it('timestamp', () => {
                const td = {
                    column: {
                        udtName: 'timestamp',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Date');
            });
            it('timestamptz', () => {
                const td = {
                    column: {
                        udtName: 'timestamptz',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Date');
            });
        });
        describe('maps to Array<number>', () => {
            it('_int2', () => {
                const td = {
                    column: {
                        udtName: '_int2',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<number>');
            });
            it('_int4', () => {
                const td = {
                    column: {
                        udtName: '_int4',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<number>');
            });
            it.skip('_int8', () => {
                const td = {
                    column: {
                        udtName: '_int8',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<number>');
            });
            it('_float4', () => {
                const td = {
                    column: {
                        udtName: '_float4',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<number>');
            });
            it('_float8', () => {
                const td = {
                    column: {
                        udtName: '_float8',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<number>');
            });
            it('_numeric', () => {
                const td = {
                    column: {
                        udtName: '_numeric',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<number>');
            });
            it('_money', () => {
                const td = {
                    column: {
                        udtName: '_money',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<number>');
            });
        });
        describe('maps to Array<boolean>', () => {
            it('_bool', () => {
                const td = {
                    column: {
                        udtName: '_bool',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<boolean>');
            });
        });
        describe('maps to Array<string>', () => {
            it('_varchar', () => {
                const td = {
                    column: {
                        udtName: '_varchar',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>');
            });
            it('_text', () => {
                const td = {
                    column: {
                        udtName: '_text',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>');
            });
            it('_citext', () => {
                const td = {
                    column: {
                        udtName: '_citext',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>');
            });
            it('_uuid', () => {
                const td = {
                    column: {
                        udtName: '_uuid',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>');
            });
            it('_bytea', () => {
                const td = {
                    column: {
                        udtName: '_bytea',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>');
            });
        });
        describe('maps to Array<Object>', () => {
            it('_json', () => {
                const td = {
                    column: {
                        udtName: '_json',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<Object>');
            });
            it('_jsonb', () => {
                const td = {
                    column: {
                        udtName: '_jsonb',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<Object>');
            });
        });
        describe('maps to Array<Date>', () => {
            it('_timestamptz', () => {
                const td = {
                    column: {
                        udtName: '_timestamptz',
                        nullable: false
                    }
                };
                node_assert_1.default.equal(mapTableDefinitionToType(td, [], options).column.tsType, 'Array<Date>');
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
//# sourceMappingURL=schemaPostgres.test.js.map