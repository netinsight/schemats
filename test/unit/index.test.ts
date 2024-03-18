/* eslint @typescript-eslint/unbound-method: 'off' */
import { typescriptOfTable, typescriptOfSchema } from '../../src/index'
jest.mock('../../src/typescript')
import * as Typescript from '../../src/typescript'
import type { Database } from '../../src/schema'
import Options from '../../src/options'

describe('index', () => {
    const options = new Options({})
    const db: Database = {
        getDefaultSchema: jest.fn(),
        getTableTypes: jest.fn().mockResolvedValue({}),
        query: jest.fn(),
        getEnumTypes: jest.fn(),
        getTableDefinition: jest.fn(),
        getSchemaTables: jest.fn().mockResolvedValue([]),
        connectionString: 'sql://'
    }

    beforeEach(() => jest.clearAllMocks())

    describe('typescriptOfTable', () => {
        it('calls functions with correct params', async () => {
            const spyGenerateTableTypes = jest.spyOn(Typescript, 'generateTableTypes').mockReturnValueOnce({
                fields: '',
                validator: { tableName: 'someTableName', fieldValidators: []}
            })
            const spyGenerateTableInterface = jest.spyOn(Typescript, 'generateTableInterface')

            await typescriptOfTable(db, 'tableName', 'schemaName', options)

            expect(db.getTableTypes).toHaveBeenCalledWith('tableName', 'schemaName', options)
            expect(spyGenerateTableTypes).toHaveBeenCalledWith(
              'tableName',
              {},
              options
            )
            expect(spyGenerateTableInterface).toHaveBeenCalledWith(
              'tableName',
              {},
              options
            )
        })

        it('merges string results', async () => {
            jest.spyOn(Typescript, 'generateTableTypes').mockReturnValueOnce({
                fields: 'generatedTableTypes\n',
                validator: { tableName: 'someTableName', fieldValidators: [] }
            })
            jest.spyOn(Typescript, 'generateTableInterface').mockReturnValueOnce('generatedTableInterfaces\n')

            const res = await typescriptOfTable(db, 'tableName', 'schemaName', new Options({}))

            expect(res).toEqual({
                interfaces: 'generatedTableTypes\ngeneratedTableInterfaces\n',
                validator: { tableName: 'someTableName', fieldValidators: [] }
            })
        })
    })

    describe('typescriptOfSchema', () => {
        const spyGenerateEnumType = jest.spyOn(Typescript, 'generateEnumType').mockReturnValue('generatedEnumTypes\n')
        const spyGenerateTableTypes = jest.spyOn(Typescript, 'generateTableTypes').mockReturnValue({
            fields: 'generatedTableTypes\n',
            validator: { tableName: 'someTableName', fieldValidators: [] }
        })

        it('has schema', async () => {
            db.getSchemaTables = jest.fn().mockResolvedValueOnce(['tablename'])

            await typescriptOfSchema(db, [], 'schemaName', {})

            expect(db.getSchemaTables).toHaveBeenCalledWith('schemaName')
            expect(db.getEnumTypes).toHaveBeenCalledWith('schemaName')
            expect(spyGenerateEnumType).toHaveBeenCalledWith(undefined, options)
            expect(spyGenerateTableTypes).toHaveBeenCalledWith('tablename', {}, options)
        })

        it('has tables provided', async () => {
            db.getEnumTypes = jest.fn().mockReturnValueOnce('enumTypes')

            await typescriptOfSchema(db, ['differentTablename'], null, {})

            expect(db.getSchemaTables).not.toHaveBeenCalled()
            expect(spyGenerateEnumType).toHaveBeenCalledWith('enumTypes', options)
            expect(spyGenerateTableTypes).toHaveBeenCalledWith('differentTablename', {}, options)
        })
    })
})
