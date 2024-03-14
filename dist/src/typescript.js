"use strict";
/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTableTypes = exports.generateEnumType = exports.generateTableInterface = void 0;
function nameIsReservedKeyword(name) {
    const reservedKeywords = ['string', 'number', 'package', 'object'];
    return reservedKeywords.indexOf(name) !== -1;
}
function normalizeName(name, options) {
    if (nameIsReservedKeyword(name)) {
        return name + '_';
    }
    else {
        return name;
    }
}
function generateTableInterface(tableNameRaw, tableDefinition, options) {
    const tableName = options.transformTypeName(tableNameRaw);
    let members = '';
    Object.keys(tableDefinition)
        .map((c) => options.transformColumnName(c))
        .forEach((columnName) => {
        members += `${columnName}: ${tableName}Fields.${normalizeName(columnName, options)};\n`;
    });
    return `
        export interface ${normalizeName(tableName, options)} {
        ${members}
        }
    `;
}
exports.generateTableInterface = generateTableInterface;
function generateEnumType(enumObject, options) {
    let enumString = '';
    for (let enumNameRaw in enumObject) {
        const enumName = options.transformTypeName(enumNameRaw);
        enumString += `export type ${enumName} = `;
        enumString += enumObject[enumNameRaw]
            .map((v) => `'${v}'`)
            .join(' | ');
        enumString += ';\n';
    }
    return enumString;
}
exports.generateEnumType = generateEnumType;
function generateTableTypes(tableNameRaw, tableDefinition, options) {
    const tableName = options.transformTypeName(tableNameRaw);
    let fields = '';
    Object.keys(tableDefinition).forEach((columnNameRaw) => {
        let type = tableDefinition[columnNameRaw].tsType;
        let nullable = tableDefinition[columnNameRaw].nullable ? '| null' : '';
        const columnName = options.transformColumnName(columnNameRaw);
        fields += `export type ${normalizeName(columnName, options)} = ${type}${nullable};\n`;
    });
    const fieldValidators = [];
    for (const [name, definition] of Object.entries(tableDefinition)) {
        fieldValidators.push({
            fieldName: name,
            validator: validatorFromColumnDefinition(definition)
        });
    }
    const validator = {
        tableName,
        fieldValidators
    };
    return {
        fields: `
        export namespace ${tableName}Fields {
        ${fields}
        }
    `,
        validator
    };
}
exports.generateTableTypes = generateTableTypes;
function validatorFromColumnDefinition(definition) {
    if (![
        'number',
        'string',
        'boolean',
        'Object',
        'Date',
        'bigint',
        'Array<string>',
        'Array<bigint>'
    ].includes(definition.tsType)) {
        throw new Error(`Unsupported ts type: ${definition.tsType}`);
    }
    return `validate('${definition.tsType}', ${definition.nullable})`;
}
//# sourceMappingURL=typescript.js.map