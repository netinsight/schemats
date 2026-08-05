#! /usr/bin/env node
/**
 * Commandline interface
 * Created by xiamx on 2016-08-10.
 */

import * as yargs from 'yargs'
import * as fs from 'fs'
import { typescriptOfSchema } from '../src/index'

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
        argv.table ??= []

        const formattedOutput = await typescriptOfSchema(
            argv.conn, argv.table, argv.schema, { camelCase: argv.camelCase, writeHeader: !argv.noHeader })
        fs.writeFileSync(argv.output, formattedOutput)

    } catch (e) {
        console.error(e)
        process.exit(1)
    }

})().then(() => {
    process.exit()
}).catch((e: any) => {
    console.warn(e)
    process.exit(1)
})
