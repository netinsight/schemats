"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const sinon = require("sinon");
const Index = require("../../src/index");
const Typescript = require("../../src/typescript");
const options_1 = require("../../src/options");
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
            assert.deepEqual(dbReflection.getTableTypes.getCall(0).args, [
                'tableName',
                'schemaName',
                new options_1.default(options)
            ]);
            assert.deepEqual(tsReflection.generateTableTypes.getCall(0).args, [
                'tableName',
                'tableTypes',
                new options_1.default(options)
            ]);
            assert.deepEqual(tsReflection.generateTableInterface.getCall(0).args, [
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
            assert.equal(typescriptString, 'generatedTableTypes\ngeneratedTableInterfaces\n');
        });
    });
    describe('typescriptOfSchema', () => {
        it.skip('has schema', async () => {
            dbReflection.getSchemaTables.returns(Promise.resolve(['tablename']));
            dbReflection.getEnumTypes.returns(Promise.resolve('enumTypes'));
            tsReflection.generateTableTypes.returns('generatedTableTypes\n');
            tsReflection.generateEnumType.returns('generatedEnumTypes\n');
            await Index.typescriptOfSchema(db, [], 'schemaName', options);
            assert.deepEqual(dbReflection.getSchemaTables.getCall(0).args[0], 'schemaName');
            assert.deepEqual(dbReflection.getEnumTypes.getCall(0).args[0], 'schemaName');
            assert.deepEqual(tsReflection.generateEnumType.getCall(0).args[0], 'enumTypes');
            assert.deepEqual(tsReflection.generateTableTypes.getCall(0).args[0], 'tablename');
        });
        it.skip('has tables provided', async () => {
            dbReflection.getSchemaTables.returns(Promise.resolve(['tablename']));
            dbReflection.getEnumTypes.returns(Promise.resolve('enumTypes'));
            tsReflection.generateTableTypes.returns('generatedTableTypes\n');
            tsReflection.generateEnumType.returns('generatedEnumTypes\n');
            await Index.typescriptOfSchema(db, ['differentTablename'], null, options);
            assert(!dbReflection.getSchemaTables.called);
            assert.deepEqual(tsReflection.generateEnumType.getCall(0).args[0], 'enumTypes');
            assert.deepEqual(tsReflection.generateTableTypes.getCall(0).args[0], 'differentTablename');
        });
    });
});
//# sourceMappingURL=index.test.js.map