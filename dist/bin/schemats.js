#! /usr/bin/env node
"use strict";
/**
 * Commandline interface
 * Created by xiamx on 2016-08-10.
 */
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
const yargs = __importStar(require("yargs"));
const fs = __importStar(require("fs"));
const index_1 = require("../src/index");
let argv = yargs
    .usage('Usage: $0 <command> [options]')
    .global('config')
    .default('config', 'schemats.json')
    .config()
    .env('SCHEMATS')
    .command('generate', 'generate type definition')
    .demand(1)
    .example('$0 generate -c postgres://username:password@localhost/db -t table1 -t table2 -s schema -o interface_output.ts', 'generate typescript interfaces from schema')
    .demand('c')
    .alias('c', 'conn')
    .nargs('c', 1)
    .describe('c', 'database connection string')
    .alias('t', 'table')
    .nargs('t', 1)
    .describe('t', 'table name')
    .alias('s', 'schema')
    .nargs('s', 1)
    .describe('s', 'schema name')
    .alias('C', 'camelCase')
    .describe('C', 'Camel-case columns')
    .describe('noHeader', 'Do not write header')
    .demand('o')
    .nargs('o', 1)
    .alias('o', 'output')
    .describe('o', 'output file name')
    .help('h')
    .alias('h', 'help')
    .argv;
(async () => {
    try {
        if (!Array.isArray(argv.table)) {
            if (!argv.table) {
                argv.table = [];
            }
            else {
                argv.table = [argv.table];
            }
        }
        let formattedOutput = await (0, index_1.typescriptOfSchema)(argv.conn, argv.table, argv.schema, { camelCase: argv.camelCase, writeHeader: !argv.noHeader });
        fs.writeFileSync(argv.output, formattedOutput);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
})().then(() => {
    process.exit();
}).catch((e) => {
    console.warn(e);
    process.exit(1);
});
//# sourceMappingURL=schemats.js.map