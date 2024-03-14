"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const assert = __importStar(require("power-assert"));
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