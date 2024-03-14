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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const Typescript = __importStar(require("../../src/typescript"));
const options_1 = __importDefault(require("../../src/options"));
const options = new options_1.default({});
describe('Typescript', () => {
    describe('generateTableInterface', () => {
        it('empty table definition object', () => {
            const tableInterface = Typescript.generateTableInterface('tableName', {}, options);
            assert.equal(tableInterface, '\n' +
                '        export interface tableName {\n' +
                '        \n' +
                '        }\n' +
                '    ');
        });
        it('table name is reserved', () => {
            const tableInterface = Typescript.generateTableInterface('package', {}, options);
            assert.equal(tableInterface, '\n' +
                '        export interface package_ {\n' +
                '        \n' +
                '        }\n' +
                '    ');
        });
        it('table with columns', () => {
            const tableInterface = Typescript.generateTableInterface('tableName', {
                col1: { udtName: 'name1', nullable: false },
                col2: { udtName: 'name2', nullable: false }
            }, options);
            assert.equal(tableInterface, '\n' +
                '        export interface tableName {\n' +
                '        col1: tableNameFields.col1;\n' +
                'col2: tableNameFields.col2;\n' +
                '\n' +
                '        }\n' +
                '    ');
        });
        it('table with reserved columns', () => {
            const tableInterface = Typescript.generateTableInterface('tableName', {
                string: { udtName: 'name1', nullable: false },
                number: { udtName: 'name2', nullable: false },
                package: { udtName: 'name3', nullable: false }
            }, options);
            assert.equal(tableInterface, '\n' +
                '        export interface tableName {\n' +
                '        string: tableNameFields.string_;\n' +
                'number: tableNameFields.number_;\n' +
                'package: tableNameFields.package_;\n' +
                '\n' +
                '        }\n' +
                '    ');
        });
    });
    describe('generateEnumType', () => {
        it('empty object', () => {
            const enumType = Typescript.generateEnumType({}, options);
            assert.equal(enumType, '');
        });
        it('with enumerations', () => {
            const enumType = Typescript.generateEnumType({
                enum1: ['val1', 'val2', 'val3', 'val4'],
                enum2: ['val5', 'val6', 'val7', 'val8']
            }, options);
            assert.equal(enumType, "export type enum1 = 'val1' | 'val2' | 'val3' | 'val4';\n" +
                "export type enum2 = 'val5' | 'val6' | 'val7' | 'val8';\n");
        });
    });
    describe('generateEnumType', () => {
        it('empty object', () => {
            const enumType = Typescript.generateEnumType({}, options);
            assert.equal(enumType, '');
        });
        it('with enumerations', () => {
            const enumType = Typescript.generateEnumType({
                enum1: ['val1', 'val2', 'val3', 'val4'],
                enum2: ['val5', 'val6', 'val7', 'val8']
            }, options);
            assert.equal(enumType, "export type enum1 = 'val1' | 'val2' | 'val3' | 'val4';\n" +
                "export type enum2 = 'val5' | 'val6' | 'val7' | 'val8';\n");
        });
    });
    describe('generateTableTypes', () => {
        it('empty table definition object', () => {
            const { fields: tableTypes } = Typescript.generateTableTypes('tableName', {}, options);
            assert.equal(tableTypes, '\n' +
                '        export namespace tableNameFields {' +
                '\n        ' +
                '\n        ' +
                '}' +
                '\n    ');
        });
        it('with table definitions', () => {
            const { fields: tableTypes } = Typescript.generateTableTypes('tableName', {
                col1: {
                    udtName: 'name1',
                    nullable: false,
                    tsType: 'string'
                },
                col2: {
                    udtName: 'name2',
                    nullable: false,
                    tsType: 'number'
                }
            }, options);
            assert.equal(tableTypes, '\n' +
                '        export namespace tableNameFields {' +
                '\n        export type col1 = string;' +
                '\nexport type col2 = number;' +
                '\n' +
                '\n        }' +
                '\n    ');
        });
        it('with nullable column definitions', () => {
            const { fields: tableTypes } = Typescript.generateTableTypes('tableName', {
                col1: {
                    udtName: 'name1',
                    nullable: true,
                    tsType: 'string'
                },
                col2: {
                    udtName: 'name2',
                    nullable: true,
                    tsType: 'number'
                }
            }, options);
            assert.equal(tableTypes, '\n' +
                '        export namespace tableNameFields {' +
                '\n        export type col1 = string| null;' +
                '\nexport type col2 = number| null;' +
                '\n' +
                '\n        }' +
                '\n    ');
        });
    });
});
//# sourceMappingURL=typescript.test.js.map