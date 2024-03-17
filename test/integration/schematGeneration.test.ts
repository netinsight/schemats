import { Database, getDatabase, typescriptOfSchema } from '../../src/index'
import { loadSchema } from '../testUtility'

describe('schemats generation integration testing', () => {
    describe('postgres', () => {
        let db: Database
        beforeAll(async () => {
            expect(process.env.POSTGRES_URL).toBeDefined()
            db = getDatabase(process.env.POSTGRES_URL!)
            await loadSchema(db, './test/fixture/postgres/initCleanup.sql')
            await loadSchema(db, './test/fixture/postgres/osm.sql')
        })

        it('Basic generation', async () => {
            const config = require('../fixture/postgres/osm.json')
            const formattedOutput = await typescriptOfSchema(
                db,
                config.tables,
                config.schema,
                { camelCase: config.camelCase, writeHeader: config.writeHeader }
            )
            expect(formattedOutput).toMatchSnapshot()
        })

        it('Camelcase generation', async () => {
            const config = require('../fixture/postgres/osm-camelcase.json')
            const formattedOutput = await typescriptOfSchema(
                db,
                config.tables,
                config.schema,
                { camelCase: config.camelCase, writeHeader: config.writeHeader }
            )
            expect(formattedOutput).toMatchSnapshot()
        })
    })

    describe('mysql', () => {
        let db: Database
        beforeAll(async () => {
            expect(process.env.MYSQL_URL).toBeDefined()
            db = getDatabase(`${process.env.MYSQL_URL}?multipleStatements=true`)
            await loadSchema(db, './test/fixture/mysql/initCleanup.sql')
        })

        it('Basic generation', async () => {
            await loadSchema(db, './test/fixture/mysql/osm.sql')
            const config = require('../fixture/mysql/osm.json')
            const formattedOutput = await typescriptOfSchema(
                db,
                config.tables,
                config.schema,
                { camelCase: config.camelCase, writeHeader: config.writeHeader }
            )
            expect(formattedOutput).toMatchSnapshot()
        })

        it('Enum conflict in columns', async () => {
            await loadSchema(db, './test/fixture/mysql/conflict.sql')
            const config = require('../fixture/mysql/conflict.json')
            await expect(typescriptOfSchema(
                db,
                config.tables,
                config.schema,
                { camelCase: config.camelCase, writeHeader: config.writeHeader }
            )).rejects.toThrow('Multiple enums with the same name and contradicting types were found: location_type: ["city","province","country"] and ["city","state","country"]')
        })
    })
})
