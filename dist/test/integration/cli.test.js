"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const assert = require("power-assert");
describe('schemats cli tool integration testing', () => {
    describe('schemats generate postgres', () => {
        before(async function () {
            if (!process.env.POSTGRES_URL) {
                return this.skip();
            }
        });
        it('should run without error', () => {
            let { status, stdout, stderr } = (0, child_process_1.spawnSync)('node', [
                'bin/schemats', 'generate',
                '-c', process.env.POSTGRES_URL || '',
                '-o', '/tmp/schemats_cli_postgres.ts'
            ], { encoding: 'utf-8' });
            console.log('opopopopop', stdout, stderr);
            assert.equal(0, status);
        });
    });
    describe('schemats generate mysql', () => {
        before(async function () {
            if (!process.env.MYSQL_URL) {
                return this.skip();
            }
        });
        it('should run without error', () => {
            let { status } = (0, child_process_1.spawnSync)('node', [
                'bin/schemats', 'generate',
                '-c', process.env.MYSQL_URL || '',
                '-s', 'test',
                '-o', '/tmp/schemats_cli_postgres.ts'
            ]);
            assert.equal(0, status);
        });
    });
});
//# sourceMappingURL=cli.test.js.map