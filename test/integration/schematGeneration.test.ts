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
                { camelCase: false, writeHeader: config.writeHeader }
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

    // describe('mysql', () => {
    //     let db: Database
    //     beforeAll(async () => {
    //         expect(process.env.MYSQL_URL).toBeDefined()
    //         db = getDatabase(`${process.env.MYSQL_URL}?multipleStatements=true`)
    //         await loadSchema(db, './test/fixture/mysql/initCleanup.sql')
    //     })

        // it('Basic generation', async () => {
        //     const inputSQLFile = 'test/fixture/mysql/osm.sql'
        //     const config = './fixture/mysql/osm.json'
        //     await writeTsFile(inputSQLFile, config, outputFile, db)
        //     expect(await compare(expectedFile, outputFile)).toBe(true)
        // })

        // it('Enum conflict in columns', async () => {
        //     const inputSQLFile = 'test/fixture/mysql/conflict.sql'
        //     const config = './fixture/mysql/conflict.json'
        //     try {
        //         await writeTsFile(inputSQLFile, config, outputFile, db)
        //     } catch (e: any) {
        //         expect(e.message).toBe('Multiple enums with the same name and contradicting types were found: location_type: ["city","province","country"] and ["city","state","country"]')
        //     }
        // })
    // })
})
