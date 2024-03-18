/* eslint @typescript-eslint/no-unsafe-return: 'off' */
import assert from 'node:assert'

import { MysqlDatabase } from '../../src/schemaMysql'
import { TableDefinition } from '../../src/schemaInterfaces'
import Options from '../../src/options'

describe('MysqlDatabase', () => {
    const mysql = new MysqlDatabase('mysql://user:password@localhost/test')

    beforeEach(() => {
        (mysql as any).db.query = jest.fn((_q, _val, cb) => cb())
    })

    describe('query', () => {
        it('query calls query async', async () => {
            await mysql.query('SELECT * FROM test_table')
            expect((mysql as any).db.query).toHaveBeenCalledWith('SELECT * FROM test_table', undefined, expect.anything())
        })
    })

    describe('queryAsync', () => {
        it('query has error', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb('ERROR'))

            await expect(mysql.query('SELECT * FROM test_table')).rejects.toEqual('ERROR')
        })

        it('query returns with results', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, []))
            const results = await mysql.query('SELECT * FROM test_table')
            expect(results).toEqual([])
        })
    })

    describe('getEnumTypes', () => {
        it('writes correct query with schema name', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, []))

            await mysql.getEnumTypes('testschema')

            expect((mysql as any).db.query).toHaveBeenCalledWith(
                'SELECT column_name, column_type, data_type ' +
                'FROM information_schema.columns ' +
                'WHERE data_type IN (\'enum\', \'set\') and table_schema = ?',
                ['testschema'],
                expect.anything()
            )
        })

        it('writes correct query without schema name', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, []))

            await mysql.getEnumTypes()

            expect((mysql as any).db.query).toHaveBeenCalledWith(
                'SELECT column_name, column_type, data_type ' +
                'FROM information_schema.columns ' +
                'WHERE data_type IN (\'enum\', \'set\') ',
                [],
                expect.anything()
            )
        })

        it('handles response', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, [
                { column_name: 'column1', column_type: 'enum(\'enum1\')', data_type: 'enum' },
                { column_name: 'column2', column_type: 'set(\'set1\')', data_type: 'set' }
            ]))

            const enumTypes = await mysql.getEnumTypes('testschema')

            expect(enumTypes).toEqual({
                enum_column1: ['enum1'],
                set_column2: ['set1']
            })
        })

        it('same column same value is accepted', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, [
                { column_name: 'column1', column_type: 'enum(\'enum1\',\'enum2\')', data_type: 'enum' },
                { column_name: 'column1', column_type: 'enum(\'enum1\',\'enum2\')', data_type: 'enum' }
            ]))

            const enumTypes = await mysql.getEnumTypes('testschema')

            expect(enumTypes).toEqual({ enum_column1: ['enum1', 'enum2'] })
        })

        it('same column different value conflict', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, [
                { column_name: 'column1', column_type: 'enum(\'enum1\')', data_type: 'enum' },
                { column_name: 'column1', column_type: 'enum(\'enum2\')', data_type: 'enum' }
            ]))

            await expect(mysql.getEnumTypes('testschema')).rejects.toThrow(
                'Multiple enums with the same name and contradicting types were found: column1: ["enum1"] and ["enum2"]'
            )
        })
    })

    describe('getTableDefinitions', () => {
        it('writes correct query', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, []))

            await mysql.getTableDefinition('testtable', 'testschema')

            expect((mysql as any).db.query).toHaveBeenCalledWith(
                'SELECT column_name, data_type, is_nullable ' +
                'FROM information_schema.columns ' +
                'WHERE table_name = ? and table_schema = ?',
                ['testtable', 'testschema'],
                expect.anything()
            )
        })

        it('handles response', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, [
                { column_name: 'column1', data_type: 'data1', is_nullable: 'NO' },
                { column_name: 'column2', data_type: 'enum', is_nullable: 'YES' },
                { column_name: 'column3', data_type: 'set', is_nullable: 'YES' }
            ]))

            const schemaTables = await mysql.getTableDefinition('testtable', 'testschema')

            expect(schemaTables).toEqual({
                column1: { udtName: 'data1', nullable: false },
                column2: { udtName: 'enum_column2', nullable: true },
                column3: { udtName: 'set_column3', nullable: true }
            })
        })
    })

    describe('getTableTypes', () => {
        const options = new Options({})

        it('gets custom types from enums', async () => {
            const mysql = new MysqlDatabase('mysql://user:password@localhost/test')
            mysql.getEnumTypes = () => Promise.resolve({enum1: [], enum2: []})
            mysql.getTableDefinition = () => Promise.resolve({ foo: { udtName: 'enum1', nullable: false } })

            const res = await mysql.getTableTypes('tableName', 'tableSchema', options)

            expect(res).toEqual({
                foo: {
                    udtName: 'enum1',
                    nullable: false,
                    tsType: 'enum1'
                }
            })
        })

        it('gets table definitions', async () => {
            const mysql = new MysqlDatabase('mysql://user:password@localhost/test')
            mysql.getEnumTypes = () => Promise.resolve({})
            mysql.getTableDefinition = () => Promise.resolve({
                table: {
                    udtName: 'name',
                    nullable: false
                }
            })

            const res = await mysql.getTableTypes('tableName', 'tableSchema', options)

            expect(res).toEqual({
                table: {
                    udtName: 'name',
                    nullable: false,
                    tsType: 'any'
                }
            })
        })
    })

    describe('getSchemaTables', () => {
        it('writes correct query', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, []))

            await mysql.getSchemaTables('testschema')

            expect((mysql as any).db.query).toHaveBeenCalledWith(
                'SELECT table_name ' +
                'FROM information_schema.columns ' +
                'WHERE table_schema = ? ' +
                'GROUP BY table_name',
                ['testschema'],
                expect.anything()
            )
        })

        it('handles table response', async () => {
            (mysql as any).db.query = jest.fn((_q, _val, cb) => cb(null, [
                { table_name: 'table1' },
                { table_name: 'table2' }
            ]))

            const schemaTables = await mysql.getSchemaTables('testschema')
            expect(schemaTables).toEqual(['table1', 'table2'])
        })
    })

    describe('mapTableDefinitionToType', () => {
        const mapTableDefinitionToType = (MysqlDatabase as any).mapTableDefinitionToType
        const options = new Options({})

        describe('maps to string', () => {
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
            it('tinytext', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'tinytext',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('mediumtext', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'mediumtext',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('longtext', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'longtext',
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
            it('geometry', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'geometry',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('set', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'set',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
            it('enum', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'enum',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'string')
            })
        })
        describe('maps to number', () => {
            it('integer', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'integer',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('int', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'int',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('smallint', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'smallint',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('mediumint', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'mediumint',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('bigint', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'bigint',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('double', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'double',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('decimal', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'decimal',
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
            it('float', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'float',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
            it('year', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'year',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'number')
            })
        })
        describe('maps to boolean', () => {
            it('tinyint', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'tinyint',
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
            it('datetime', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'datetime',
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
        })
        describe('maps to Buffer', () => {
            it('tinyblob', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'tinyblob',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Buffer')
            })
            it('mediumblob', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'mediumblob',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Buffer')
            })
            it('longblob', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'longblob',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Buffer')
            })
            it('blob', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'blob',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Buffer')
            })
            it('binary', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'binary',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Buffer')
            })
            it('varbinary', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'varbinary',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Buffer')
            })
            it('bit', () => {
                const td: TableDefinition = {
                    column: {
                        udtName: 'bit',
                        nullable: false
                    }
                }
                assert.equal(mapTableDefinitionToType(td,[],options).column.tsType, 'Buffer')
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
                assert.equal(mapTableDefinitionToType(td,['CustomType'],options).column.tsType, 'CustomType')
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
                assert.equal(mapTableDefinitionToType(td,['CustomType'],options).column.tsType, 'any')
            })
        })
    })
})
