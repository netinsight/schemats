"use strict";
/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTableTypes = exports.generateEnumType = exports.generateTableInterface = void 0;
function nameIsReservedKeyword(name) {
    var reservedKeywords = ['string', 'number', 'package', 'object'];
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
    var tableName = options.transformTypeName(tableNameRaw);
    var members = '';
    Object.keys(tableDefinition)
        .map(function (c) { return options.transformColumnName(c); })
        .forEach(function (columnName) {
        members += columnName + ": " + tableName + "Fields." + normalizeName(columnName, options) + ";\n";
    });
    return "\n        export interface " + normalizeName(tableName, options) + " {\n        " + members + "\n        }\n    ";
}
exports.generateTableInterface = generateTableInterface;
function generateEnumType(enumObject, options) {
    var enumString = '';
    for (var enumNameRaw in enumObject) {
        var enumName = options.transformTypeName(enumNameRaw);
        enumString += "export type " + enumName + " = ";
        enumString += enumObject[enumNameRaw]
            .map(function (v) { return "'" + v + "'"; })
            .join(' | ');
        enumString += ';\n';
    }
    return enumString;
}
exports.generateEnumType = generateEnumType;
function generateTableTypes(tableNameRaw, tableDefinition, options) {
    var tableName = options.transformTypeName(tableNameRaw);
    var fields = '';
    Object.keys(tableDefinition).forEach(function (columnNameRaw) {
        var type = tableDefinition[columnNameRaw].tsType;
        var nullable = tableDefinition[columnNameRaw].nullable ? '| null' : '';
        var columnName = options.transformColumnName(columnNameRaw);
        fields += "export type " + normalizeName(columnName, options) + " = " + type + nullable + ";\n";
    });
    var fieldValidators = [];
    for (var _i = 0, _a = Object.entries(tableDefinition); _i < _a.length; _i++) {
        var _b = _a[_i], name = _b[0], definition = _b[1];
        fieldValidators.push({
            fieldName: name,
            validator: validatorFromColumnDefinition(definition)
        });
    }
    var validator = {
        tableName: tableName,
        fieldValidators: fieldValidators
    };
    return {
        fields: "\n        export namespace " + tableName + "Fields {\n        " + fields + "\n        }\n    ",
        validator: validator
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
        'Array<string>'
    ].includes(definition.tsType)) {
        throw new Error("Unsupported ts type: " + definition.tsType);
    }
    return "validate('" + definition.tsType + "', " + definition.nullable + ")";
}
//# sourceMappingURL=typescript.js.map