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
const index_1 = require("../../src/index");
jest.mock('../../src/typescript');
const Typescript = __importStar(require("../../src/typescript"));
const options_1 = __importDefault(require("../../src/options"));
describe('index', () => {
    const options = new options_1.default({});
    const db = {
        getDefaultSchema: jest.fn(),
        getTableTypes: jest.fn().mockResolvedValue({}),
        query: jest.fn(),
        getEnumTypes: jest.fn(),
        getTableDefinition: jest.fn(),
        getSchemaTables: jest.fn().mockResolvedValue([]),
        connectionString: 'sql://'
    };
    beforeEach(() => jest.clearAllMocks());
    describe('typescriptOfTable', () => {
        it('calls functions with correct params', async () => {
            const spyGenerateTableTypes = jest.spyOn(Typescript, 'generateTableTypes').mockReturnValueOnce({
                fields: '',
                validator: { tableName: 'someTableName', fieldValidators: [] }
            });
            const spyGenerateTableInterface = jest.spyOn(Typescript, 'generateTableInterface');
            await (0, index_1.typescriptOfTable)(db, 'tableName', 'schemaName', options);
            expect(db.getTableTypes).toHaveBeenCalledWith('tableName', 'schemaName', options);
            expect(spyGenerateTableTypes).toHaveBeenCalledWith('tableName', {}, options);
            expect(spyGenerateTableInterface).toHaveBeenCalledWith('tableName', {}, options);
        });
        it('merges string results', async () => {
            jest.spyOn(Typescript, 'generateTableTypes').mockReturnValueOnce({
                fields: 'generatedTableTypes\n',
                validator: { tableName: 'someTableName', fieldValidators: [] }
            });
            jest.spyOn(Typescript, 'generateTableInterface').mockReturnValueOnce('generatedTableInterfaces\n');
            const res = await (0, index_1.typescriptOfTable)(db, 'tableName', 'schemaName', new options_1.default({}));
            expect(res).toEqual({
                interfaces: 'generatedTableTypes\ngeneratedTableInterfaces\n',
                validator: { tableName: 'someTableName', fieldValidators: [] }
            });
        });
    });
    describe('typescriptOfSchema', () => {
        const spyGenerateEnumType = jest.spyOn(Typescript, 'generateEnumType').mockReturnValue('generatedEnumTypes\n');
        const spyGenerateTableTypes = jest.spyOn(Typescript, 'generateTableTypes').mockReturnValue({
            fields: 'generatedTableTypes\n',
            validator: { tableName: 'someTableName', fieldValidators: [] }
        });
        it('has schema', async () => {
            db.getSchemaTables = jest.fn().mockResolvedValueOnce(['tablename']);
            await (0, index_1.typescriptOfSchema)(db, [], 'schemaName', {});
            expect(db.getSchemaTables).toHaveBeenCalledWith('schemaName');
            expect(db.getEnumTypes).toHaveBeenCalledWith('schemaName');
            expect(spyGenerateEnumType).toHaveBeenCalledWith(undefined, options);
            expect(spyGenerateTableTypes).toHaveBeenCalledWith('tablename', {}, options);
        });
        it('has tables provided', async () => {
            db.getEnumTypes = jest.fn().mockReturnValueOnce('enumTypes');
            await (0, index_1.typescriptOfSchema)(db, ['differentTablename'], null, {});
            expect(db.getSchemaTables).not.toHaveBeenCalled();
            expect(spyGenerateEnumType).toHaveBeenCalledWith('enumTypes', options);
            expect(spyGenerateTableTypes).toHaveBeenCalledWith('differentTablename', {}, options);
        });
    });
});
//# sourceMappingURL=index.test.js.map