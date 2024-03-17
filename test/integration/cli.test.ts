import { spawnSync } from 'node:child_process'

describe('schemats cli tool integration testing', () => {
    it('show usage', () => {
        const conn = process.env.POSTGRES_URL
        expect(conn).toBeDefined()
        const {status, stdout, stderr} = spawnSync('npx', ['.'], { encoding: 'utf-8' })
        expect(status).toBe(1)
        expect(stdout).toBe('')
        expect(stderr).toMatch(/^Usage: schemats <command> \[options\]/)
    })

    describe('schemats generate postgres', () => {
        it('should run without error', () => {
            const conn = process.env.POSTGRES_URL
            expect(conn).toBeDefined()
            const {status, stdout, stderr} = spawnSync('npx', [
                '.', 'generate',
                '-c', conn!,
                '-o', '/tmp/schemats_cli_postgres.ts'
            ], { encoding: 'utf-8' })
            expect(status).toBe(0)
            expect(stdout).toBe('')
            expect(stderr).toBe('')
        })
    })

    describe.skip('schemats generate mysql', () => {
        it('should run without error', () => {
            const conn = process.env.MYSQL_URL
            expect(conn).toBeDefined()
            const {status, stdout, stderr} = spawnSync('npx', [
                '.', 'generate',
                '-c', conn!,
                '-s', 'test',
                '-o', '/tmp/schemats_cli_postgres.ts'
            ])
            expect(status).toBe(0)
            expect(stdout).toBe('')
            expect(stderr).toBe('')
        })
    })
})
