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
const node_assert_1 = __importDefault(require("node:assert"));
const sinon = __importStar(require("sinon"));
const Index = __importStar(require("../../src/index"));
const Typescript = __importStar(require("../../src/typescript"));
const options_1 = __importDefault(require("../../src/options"));
const options = {};
describe('index', () => {
    const typedTableSandbox = sinon.sandbox.create();
    const db = {
        getDefaultSchema: typedTableSandbox.stub(),
        getTableTypes: typedTableSandbox.stub(),
        query: typedTableSandbox.stub(),
        getEnumTypes: typedTableSandbox.stub(),
        getTableDefinition: typedTableSandbox.stub(),
        getSchemaTables: typedTableSandbox.stub(),
        connectionString: 'sql://'
    };
    const tsReflection = Typescript;
    const dbReflection = db;
    before(() => {
        typedTableSandbox.stub(Typescript, 'generateEnumType');
        typedTableSandbox.stub(Typescript, 'generateTableTypes');
        typedTableSandbox.stub(Typescript, 'generateTableInterface');
    });
    beforeEach(() => {
        typedTableSandbox.reset();
    });
    after(() => {
        typedTableSandbox.restore();
    });
    describe('typescriptOfTable', () => {
        it('calls functions with correct params', async () => {
            dbReflection.getTableTypes.returns(Promise.resolve('tableTypes'));
            tsReflection.generateTableTypes.returns('generatedTableTypes\n');
            tsReflection.generateTableInterface.returns('generatedTableInterfaces\n');
            await Index.typescriptOfTable(db, 'tableName', 'schemaName', new options_1.default(options));
            node_assert_1.default.deepEqual(dbReflection.getTableTypes.getCall(0).args, [
                'tableName',
                'schemaName',
                new options_1.default(options)
            ]);
            node_assert_1.default.deepEqual(tsReflection.generateTableTypes.getCall(0).args, [
                'tableName',
                'tableTypes',
                new options_1.default(options)
            ]);
            node_assert_1.default.deepEqual(tsReflection.generateTableInterface.getCall(0).args, [
                'tableName',
                'tableTypes',
                new options_1.default(options)
            ]);
        });
        it.skip('merges string results', async () => {
            dbReflection.getTableTypes.returns(Promise.resolve('tableTypes'));
            tsReflection.generateTableTypes.returns('generatedTableTypes\n');
            tsReflection.generateTableInterface.returns('generatedTableInterfaces\n');
            const typescriptString = await Index.typescriptOfTable(db, 'tableName', 'schemaName', new options_1.default(options));
            // typescriptString is not string
            node_assert_1.default.equal(typescriptString, 'generatedTableTypes\ngeneratedTableInterfaces\n');
        });
    });
    describe('typescriptOfSchema', () => {
        it.skip('has schema', async () => {
            dbReflection.getSchemaTables.returns(Promise.resolve(['tablename']));
            dbReflection.getEnumTypes.returns(Promise.resolve('enumTypes'));
            tsReflection.generateTableTypes.returns('generatedTableTypes\n');
            tsReflection.generateEnumType.returns('generatedEnumTypes\n');
            await Index.typescriptOfSchema(db, [], 'schemaName', options);
            node_assert_1.default.deepEqual(dbReflection.getSchemaTables.getCall(0).args[0], 'schemaName');
            node_assert_1.default.deepEqual(dbReflection.getEnumTypes.getCall(0).args[0], 'schemaName');
            node_assert_1.default.deepEqual(tsReflection.generateEnumType.getCall(0).args[0], 'enumTypes');
            node_assert_1.default.deepEqual(tsReflection.generateTableTypes.getCall(0).args[0], 'tablename');
        });
        it.skip('has tables provided', async () => {
            dbReflection.getSchemaTables.returns(Promise.resolve(['tablename']));
            dbReflection.getEnumTypes.returns(Promise.resolve('enumTypes'));
            tsReflection.generateTableTypes.returns('generatedTableTypes\n');
            tsReflection.generateEnumType.returns('generatedEnumTypes\n');
            await Index.typescriptOfSchema(db, ['differentTablename'], null, options);
            (0, node_assert_1.default)(!dbReflection.getSchemaTables.called);
            node_assert_1.default.deepEqual(tsReflection.generateEnumType.getCall(0).args[0], 'enumTypes');
            node_assert_1.default.deepEqual(tsReflection.generateTableTypes.getCall(0).args[0], 'differentTablename');
        });
    });
});
//# sourceMappingURL=index.test.js.map