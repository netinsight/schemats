import assert from 'node:assert'

import { PostgresDatabase } from '../../src/schemaPostgres'
import { TableDefinition } from '../../src/schemaInterfaces'
import Options from '../../src/options'

describe('PostgresDatabase', () => {
    const pg = new PostgresDatabase('something')

    beforeEach(() => {
        (pg as any).db = {
            query: jest.fn(),
            each: jest.fn(),
            map: jest.fn()
        }
    })

    describe('query', () => {
        it('calls postgres query', async () => {
            (pg as any).db = { query: jest.fn() }
            await pg.query('SELECT * FROM TEST')
            expect((pg as any).db.query).toHaveBeenCalledWith('SELECT * FROM TEST')
        })
    })

    describe('getEnumTypes', () => {
        it('writes correct query with schema name', async () => {
            await pg.getEnumTypes('schemaName')
            expect((pg as any).db.each).toHaveBeenCalledWith(
            'select n.nspname as schema, t.typname as name, e.enumlabel as value ' +
                'from pg_type t join pg_enum e on t.oid = e.enumtypid ' +
                'join pg_catalog.pg_namespace n ON n.oid = t.typnamespace ' +
                'where n.nspname = \'schemaName\' ' +
            'order by t.typname asc, e.enumlabel asc;', [], expect.anything())
        })

        it('writes correct query without schema name', async () => {
            await pg.getEnumTypes()
            expect((pg as any).db.each).toHaveBeenCalledWith(
                'select n.nspname as schema, t.typname as name, e.enumlabel as value ' +
                'from pg_type t join pg_enum e on t.oid = e.enumtypid ' +
                'join pg_catalog.pg_namespace n ON n.oid = t.typnamespace  ' +
                'order by t.typname asc, e.enumlabel asc;', [], expect.anything())
        })

        it('handles response from db', async () => {
            let enums = await pg.getEnumTypes()
            const callback = (pg as any).db.each.mock.calls[0][2]
            const dbResponse = [
                {name: 'name', value: 'value1'},
                {name: 'name', value: 'value2'}
            ]
            dbResponse.forEach(callback)
            assert.deepEqual(enums, {name: ['value1', 'value2']})
        })
    })

    describe('getTableDefinition', () => {
        it('writes correct query', async () => {
            await pg.getTableDefinition('tableName', 'schemaName')
            expect((pg as any).db.each).toHaveBeenCalledWith(
                'SELECT column_name, udt_name, is_nullable ' +
                'FROM information_schema.columns ' +
              'WHERE table_name = $1 and table_schema = $2',
              ['tableName', 'schemaName'],
              expect.anything()
            )
        })

        it('handles response from db', async () => {
            let tableDefinition = await pg.getTableDefinition('tableName', 'schemaName')
            const callback = (pg as any).db.each.mock.calls[0][2]
            const dbResponse = [
                {column_name: 'col1', udt_name: 'int2', is_nullable: 'YES'},
                {column_name: 'col2', udt_name: 'text', is_nullable: 'NO'}
            ]
            dbResponse.forEach(callback)
            assert.deepEqual(tableDefinition, {
                col1: { udtName: 'int2', nullable: true },
                col2: { udtName: 'text', nullable: false }
            })
        })
    })

    describe('getTableTypes', () => {
        it('gets custom types from enums', async () => {
            const pg = new PostgresDatabase('something')
            pg.getEnumTypes = () => Promise.resolve({enum1: [], enum2: []})
            pg.getTableDefinition = () => Promise.resolve({ foo: { udtName: 'enum1', nullable: false } })

            const res = await pg.getTableTypes('tableName', 'tableSchema', new Options({}))

            expect(res).toEqual({
                foo: {
                    udtName: 'enum1',
                    nullable: false,
                    tsType: 'enum1'
                }
            })
        })

        it('gets table definitions', async () => {
            const pg = new PostgresDatabase('something')
            pg.getEnumTypes = () => Promise.resolve({})
            pg.getTableDefinition = () => Promise.resolve({
                table: {
                    udtName: 'name',
                    nullable: false
                }
            })

            const res = await pg.getTableTypes('tableName', 'tableSchema', new Options({}))

            expect(res).toEqual({
                table: {
                    udtName: 'name',
                    nullable: false,
                    tsType: 'string'
                }
            })
        })
    })

    describe('getSchemaTables', () => {
        it('writes correct query', async () => {
            await pg.getSchemaTables('schemaName')

            expect((pg as any).db.map).toHaveBeenCalledWith(
                'SELECT table_name ' +
                'FROM information_schema.columns ' +
                'WHERE table_schema = $1 ' +
                'GROUP BY table_name ' +
                'ORDER BY table_name',
                ['schemaName'], expect.anything())
        })

        it('handles response from db', async () => {
            await pg.getSchemaTables('schemaName')

            const callback = (pg as any).db.map.mock.calls[0][2]
            const dbResponse = [
                {table_name: 'table1'},
                {table_name: 'table2'}
            ]
            const schemaTables = dbResponse.map(callback)
            assert.deepEqual(schemaTables, ['table1','table2'])
        })
    })

    describe('mapTableDefinitionToType', () => {
        const mapTableDefinitionToType = (PostgresDatabase as any).mapTableDefinitionToType
        const options = new Options({})

        describe('maps to string', () => {
            it('bpchar', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'bpchar',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('char', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'char',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('varchar', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'varchar',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('text', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'text',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('citext', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'citext',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('uuid', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'uuid',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('bytea', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'bytea',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('inet', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'inet',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('time', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'time',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('timetz', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'timetz',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('interval', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'interval',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('name', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'name',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
        })
        describe('maps to number', () => {
            it('int2', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'int2',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('int4', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'int4',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it.skip('int8', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'int8',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('float4', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'float4',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('float8', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'float8',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('numeric', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'numeric',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('money', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'money',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('oid', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'oid',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
        })
        describe('maps to boolean', () => {
            it('bool', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'bool',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'boolean')
            })
        })
        describe('maps to Object', () => {
            it('json', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'json',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Object')
            })
            it('jsonb', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'jsonb',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Object')
            })
        })
        describe('maps to Date', () => {
            it('date', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'date',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Date')
            })
            it('timestamp', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'timestamp',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Date')
            })
            it('timestamptz', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'timestamptz',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Date')
            })
        })
        describe('maps to Array<number>', () => {
            it('_int2', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_int2',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<number>')
            })
            it('_int4', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_int4',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<number>')
            })
            it.skip('_int8', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_int8',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<number>')
            })
            it('_float4', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_float4',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<number>')
            })
            it('_float8', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_float8',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<number>')
            })
            it('_numeric', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_numeric',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<number>')
            })
            it('_money', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_money',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<number>')
            })
        })
        describe('maps to Array<boolean>', () => {
            it('_bool', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_bool',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<boolean>')
            })
        })
        describe('maps to Array<string>', () => {
            it('_varchar', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_varchar',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>')
            })
            it('_text', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_text',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>')
            })
            it('_citext', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_citext',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>')
            })
            it('_uuid', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_uuid',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>')
            })
            it('_bytea', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_bytea',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'Array<string>')
            })
        })

        describe('maps to Array<Object>', () => {
            it('_json', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_json',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<Object>')
            })
            it('_jsonb', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_jsonb',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<Object>')
            })
        })

        describe('maps to Array<Date>', () => {
            it('_timestamptz', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: '_timestamptz',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Array<Date>')
            })
        })

        describe('maps to custom', () => {
            it('CustomType', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'CustomType',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'CustomType')
            })
        })
        describe('maps to any', () => {
            it('UnknownType', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'UnknownType',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td, ['CustomType'], options).column.tsType, 'any')
            })
        })
    })
})
