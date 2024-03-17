import { spawnSync } from 'node:child_process'

import { getDatabase } from '../../src/index'
import { loadSchema } from '../testUtility'

describe('schemats cli tool integration testing', () => {
    it('show usage', () => {
        const {status, stdout, stderr} = spawnSync('npx', ['.'], { encoding: 'utf-8' })
        expect(status).toBe(1)
        expect(stdout).toBe('')
        expect(stderr).toMatch(/^Usage: schemats <command> \[options\]/)
    })

    describe('schemats generate postgres', () => {
        const conn = process.env.POSTGRES_URL!
        beforeAll(async () => {
          expect(conn).toMatch(/^postgres:\/\/.+/)
            const db = getDatabase(conn)
            await loadSchema(db, './test/fixture/postgres/initCleanup.sql')
        })

        it('should run without error', () => {
            const res = spawnSync('npx', [
                '.', 'generate',
                '-c', conn!,
                '-o', '/tmp/schemats_cli_postgres.ts'
            ], { encoding: 'utf-8' })
            expect(res).toEqual(expect.objectContaining({
                status: 0,
                stdout: '',
                stderr: '',
            }))
        })
    })

    describe('schemats generate mysql', () => {
        const conn = process.env.MYSQL_URL!
        beforeAll(async () => {
            expect(conn).toMatch(/^mysql:\/\/.+/)
            const db = getDatabase(`${process.env.MYSQL_URL}?multipleStatements=true`)
            await loadSchema(db, './test/fixture/mysql/initCleanup.sql')
        })

        it('should run without error', () => {
            const res = spawnSync('npx', [
                '.', 'generate',
                '-c', conn,
                '-o', '/tmp/schemats_cli_mysql.ts'
            ], { encoding: 'utf-8'})
            expect(res).toEqual(expect.objectContaining({
                status: 0,
                stdout: '',
                stderr: '',
            }))
        })
    })
})
