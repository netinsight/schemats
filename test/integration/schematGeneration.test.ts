import { Database, getDatabase, typescriptOfSchema } from '../../src/index'
import { loadSchema } from '../testUtility'

import postgresOsm from '../fixture/postgres/osm.json'
import postgresOsmCamelcase from '../fixture/postgres/osm-camelcase.json'

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
            const config: any = postgresOsm
            const formattedOutput = await typescriptOfSchema(
                db,
                config.tables,
                config.schema,
                { camelCase: config.camelCase, writeHeader: config.writeHeader }
            )
            expect(formattedOutput).toMatchSnapshot()
        })

        it('Camelcase generation', async () => {
          const config = postgresOsmCamelcase
            const formattedOutput = await typescriptOfSchema(
                db,
                config.tables,
                config.schema,
                { camelCase: config.camelCase, writeHeader: config.writeHeader }
            )
            expect(formattedOutput).toMatchSnapshot()
        })
    })
})
