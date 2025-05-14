/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */

import { ColumnDefinition, TableDefinition } from './schemaInterfaces'
import Options from './options'

function nameIsReservedKeyword (name: string): boolean {
    const reservedKeywords = ['string', 'number', 'package', 'object']
    return reservedKeywords.indexOf(name) !== -1
}

function normalizeName (name: string): string {
    if (nameIsReservedKeyword(name)) {
        return name + '_'
    } else {
        return name
    }
}

export function generateTableInterface (
    tableNameRaw: string,
    tableDefinition: TableDefinition,
    options: Options
) {
    const tableName = options.transformTypeName(tableNameRaw)
    let members = ''
    Object.keys(tableDefinition)
        .map((c) => options.transformColumnName(c))
        .forEach((columnName) => {
            members += `${columnName}: ${tableName}Fields.${normalizeName(columnName)};\n`
        })

    return `
        export interface ${normalizeName(tableName)} {
        ${members}
        }
    `
}

export function generateEnumType (enumObject: any, options: Options) {
    let enumString = ''
    for (const enumNameRaw in enumObject) {
        const enumName = options.transformTypeName(enumNameRaw)
        enumString += `export type ${enumName} = `
        enumString += enumObject[enumNameRaw]
            .map((v: string) => `'${v}'`)
            .join(' | ')
        enumString += ';\n'
    }
    return enumString
}

export interface FieldValidator {
    fieldName: string
    validator: string
}

export interface TableValidator {
    tableName: string
    fieldValidators: FieldValidator[]
}

export function generateTableTypes (
    tableNameRaw: string,
    tableDefinition: TableDefinition,
    options: Options
): { fields: string; validator: TableValidator } {
    const tableName = options.transformTypeName(tableNameRaw)
    let fields = ''
    Object.keys(tableDefinition).forEach((columnNameRaw) => {
        const type = tableDefinition[columnNameRaw].tsType
        const nullable = tableDefinition[columnNameRaw].nullable ? '| null' : ''
        const columnName = options.transformColumnName(columnNameRaw)
        fields += `export type ${normalizeName(columnName)} = ${type}${nullable};\n`
    })
    const fieldValidators: FieldValidator[] = []
    for (const [name, definition] of Object.entries(tableDefinition)) {
        fieldValidators.push({
            fieldName: name,
            validator: validatorFromColumnDefinition(definition)
        })
    }

    const validator = {
        tableName,
        fieldValidators
    }
    return {
        fields: `
        export namespace ${tableName}Fields {
        ${fields}
        }
    `,
        validator
    }
}
function validatorFromColumnDefinition (definition: ColumnDefinition): string {
    if (
        ![
            'number',
            'string',
            'boolean',
            'Object',
            'Date',
            'bigint',
            'Array<string>',
            'Array<bigint>',
            'Array<number>',
            'Array<number>|null',
            'Array<Object>'
        ].includes(definition.tsType!)
    ) {
        throw new Error(`Unsupported ts type: ${JSON.stringify(definition)}`)
    }
    return `validate('${definition.tsType}', ${definition.nullable})`
}
