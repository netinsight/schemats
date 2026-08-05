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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = __importStar(require("yargs"));
const fs = __importStar(require("fs"));
const index_1 = require("../src/index");
const argv = yargs
    .usage('Usage: $0 <command> [options]')
    .global('config')
    .default('config', 'schemats.json')
    .config()
    .env('SCHEMATS')
    .command('generate', 'generate type definition')
    .demand(1)
    .example('$0 generate -c postgres://username:password@localhost/db -t table1 -t table2 -s schema -o interface_output.ts', 'generate typescript interfaces from schema')
    .options({
    conn: { alias: 'c', demandOption: true, nargs: 1, describe: 'database connection string', type: 'string' },
    table: { alias: 't', nargs: 1, describe: 'table name', type: 'string', array: true },
    schema: { alias: 's', nargs: 1, describe: 'schema name', type: 'string' },
    camelCase: { alias: 'C', describe: 'Camel-case columns', type: 'boolean' },
    noHeader: { describe: 'Do not write header', type: 'boolean' },
    output: { alias: 'o', demandOption: true, nargs: 1, describe: 'output file name', type: 'string' }
})
    .help('h')
    .alias('h', 'help')
    .parseSync();
(async () => {
    try {
        argv.table ??= [];
        const formattedOutput = await (0, index_1.typescriptOfSchema)(argv.conn, argv.table, argv.schema, { camelCase: argv.camelCase, writeHeader: !argv.noHeader });
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