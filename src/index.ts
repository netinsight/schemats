/**
 * Schemats takes sql database schema and creates corresponding typescript definitions
 * Created by xiamx on 2016-08-10.
 */

import {
    generateEnumType,
    generateTableTypes,
    generateTableInterface,
    TableValidator
} from './typescript'
import { getDatabase, Database } from './schema'
import Options, { OptionValues } from './options'
import { processString, Options as ITFOptions } from 'typescript-formatter'
import { version as pkgVersion } from '../package.json'

function getTime () {
    const padTime = (value: number) => `0${value}`.slice(-2)
    const time = new Date()
    const yyyy = time.getFullYear()
    const MM = padTime(time.getMonth() + 1)
    const dd = padTime(time.getDate())
    const hh = padTime(time.getHours())
    const mm = padTime(time.getMinutes())
    const ss = padTime(time.getSeconds())
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`
}

function buildHeader (
    db: Database,
    tables: string[],
    schema: string | null,
    options: OptionValues
): string {
    const commands = [
        'schemats',
        'generate',
        '-c',
        db.connectionString.replace(/:\/\/.*@/, '://username:password@')
    ]
    if (options.camelCase) commands.push('-C')
    if (tables.length > 0) {
        tables.forEach((t: string) => {
            commands.push('-t', t)
        })
    }
    if (schema) {
        commands.push('-s', schema)
    }

    return `
        /**
         * AUTO-GENERATED FILE @ ${getTime()} - DO NOT EDIT!
         *
         * This file was automatically generated fby schemats v.${pkgVersion}
         * $ ${commands.join(' ')}
         *
         */

    `
}

export async function typescriptOfTable (
    db: Database | string,
    table: string,
    schema: string,
    options = new Options()
): Promise<{ interfaces: string; validator: TableValidator }> {
    if (typeof db === 'string') {
        db = getDatabase(db)
    }

    let interfaces = ''
    const tableTypes = await db.getTableTypes(table, schema, options)
    const { fields, validator } = generateTableTypes(
        table,
        tableTypes,
        options
    )
    interfaces += fields
    interfaces += generateTableInterface(table, tableTypes, options)
    return { interfaces, validator }
}

export function validatorToString (validator: TableValidator) {
    const lines: string[] = [`    ${validator.tableName}: {`]
    for (const field of validator.fieldValidators) {
        lines.push(`        ${field.fieldName}: ${field.validator},`)
    }
    lines.push('},')
    return lines.join('\n')
}

export async function typescriptOfSchema (
    db: Database | string,
    tables: string[] = [],
    schema: string | null = null,
    options: OptionValues = {}
): Promise<string> {
    if (typeof db === 'string') {
        db = getDatabase(db)
    }

    if (!schema) {
        schema = db.getDefaultSchema()
    }

    if (tables.length === 0) {
        tables = await db.getSchemaTables(schema)
    }

    const optionsObject = new Options(options)

    const enumTypes = generateEnumType(
        await db.getEnumTypes(schema),
        optionsObject
    )
    const tableResultPromises = tables.map((table) =>
        typescriptOfTable(db, table, schema!, optionsObject)
    )
    const tableResults = await Promise.all(tableResultPromises)
    const interfaces = tableResults.map((r) => r.interfaces).join('')
    const validators = tableResults.map((r) => r.validator)

    const validatorStrings = [
        `
interface DataTypes {
    string: string
    boolean: boolean
    Date: Date
    bigint: bigint
    number: number
    Object: Object
    "Array<string>": string[]
    "Array<bigint>": bigint[]
    "Array<number>": number[]
}

type DataType = DataTypes[keyof DataTypes]

export interface ColumnSpec<T extends DataType> {
    validate: (v: any) => boolean
    parse: (v: string) => T
    nullable: boolean
    type: keyof DataTypes
}

function validate<K extends keyof DataTypes>(type: K, nullable: boolean): ColumnSpec<DataTypes[K]> {
    const validators: {
        [t in keyof DataTypes]: (v: any) => boolean
    } = {
        string: (v: any) => typeof v == 'string',
        number: (v: any) => typeof v == 'number',
        bigint: (v: any) => typeof v == 'bigint',
        Date: (v: any) => Object.prototype.toString.call(v) == '[object Date]' && !isNaN(v),
        Object: (v: any) => typeof v == 'object' && !!v,
        boolean: (v: any) => typeof v == 'boolean',
        "Array<string>": (v: any) => Array.isArray(v) && v.every(item => typeof item == 'string'),
        "Array<bigint>": (v: any) => Array.isArray(v) && v.every(item => typeof item == 'bigint'),
        "Array<number>": (v: any) => Array.isArray(v) && v.every(item => typeof item == 'number')
    }

    const parsers: {
        [t in keyof DataTypes]: (v: string) => DataTypes[t]
    } = {
        string: (v: string) => v,
        number: (v: string) => parseFloat(v),
        bigint: (v: string) => BigInt(v),
        Date: (v: string) => new Date(v),
        Object: (v: string) => JSON.parse(v),
        boolean: (v: string) => {
            if (v == 'true') {
                return true
            }
            if (v == 'false') {
                return false
            }
            throw new Error('Could not parse ' + v + ' as boolean')
        },
        "Array<string>": (v: string) => {
            const json = JSON.parse(v)
            if (!Array.isArray(json) || json.some(item => typeof item != 'string')) {
                throw new Error('String not parsable as string array')
            }
            return json as string[]
        },
        "Array<bigint>": (v: string) => {
            const json = JSON.parse(v)
            if (!Array.isArray(json) || json.some(item => typeof item != 'bigint')) {
                throw new Error('String not parsable as bigint array')
            }
            return json as bigint[]
        },
        "Array<number>": (v: string) => {
            const json = JSON.parse(v)
            if (!Array.isArray(json) || json.some(item => typeof item != 'number')) {
                throw new Error('String not parsable as number array')
            }
            return json as number[]
        }
    }

    if (!(type in validators)) {
        throw new Error('Unsupported type: ' + type)
    }

    const validateFn = validators[type]

    const validate = (value: any) => {
        if (value === null) {
            return nullable
        }

        if (!validateFn) {
            return false
        }
        return validateFn(value)
    }

    const parse = parsers[type]
    return { validate, nullable, type, parse: parse as ColumnSpec<DataTypes[K]>['parse'] }
}
export const Validator = {`
    ]
    for (const validator of validators) {
        validatorStrings.push(validatorToString(validator))
    }
    validatorStrings.push('}')

    let output = ''
    if (optionsObject.options.writeHeader) {
        output += buildHeader(db, tables, schema, options)
    }
    output += enumTypes
    output += interfaces
    output += validatorStrings.join('\n')

    const formatterOption: ITFOptions = {
        replace: false,
        verify: false,
        tsconfig: true,
        tslint: false,
        editorconfig: true,
        tsfmt: true,
        vscode: false,
        tsconfigFile: null,
        tslintFile: null,
        vscodeFile: null,
        tsfmtFile: null
    }

    const processedResult = await processString(
        'schema.ts',
        output,
        formatterOption
    )
    return processedResult.dest
}

export { Database, getDatabase } from './schema'
export { Options, OptionValues }
