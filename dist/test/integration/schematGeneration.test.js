"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const power_assert_1 = __importDefault(require("power-assert"));
const index_1 = require("../../src/index");
const testUtility_1 = require("../testUtility");
describe('schemat generation integration testing', () => {
    describe('postgres', () => {
        let db;
        beforeAll(async () => {
            expect(process.env.POSTGRES_URL).toBeDefined();
            db = (0, index_1.getDatabase)(process.env.POSTGRES_URL);
            await (0, testUtility_1.loadSchema)(db, './test/fixture/postgres/initCleanup.sql');
        });
        it('Basic generation', async () => {
            const inputSQLFile = 'test/fixture/postgres/osm.sql';
            const outputFile = './test/actual/postgres/osm.ts';
            const expectedFile = './test/expected/postgres/osm.ts';
            const config = './fixture/postgres/osm.json';
            await (0, testUtility_1.writeTsFile)(inputSQLFile, config, outputFile, db);
            return (0, power_assert_1.default)(await (0, testUtility_1.compare)(expectedFile, outputFile));
        });
        it('Camelcase generation', async () => {
            const inputSQLFile = 'test/fixture/postgres/osm.sql';
            const outputFile = './test/actual/postgres/osm-camelcase.ts';
            const expectedFile = './test/expected/postgres/osm-camelcase.ts';
            const config = './fixture/postgres/osm-camelcase.json';
            await (0, testUtility_1.writeTsFile)(inputSQLFile, config, outputFile, db);
            return (0, power_assert_1.default)(await (0, testUtility_1.compare)(expectedFile, outputFile));
        });
    });
    describe('mysql', () => {
        let db;
        beforeAll(async () => {
            expect(process.env.MYSQL_URL).toBeDefined();
            db = (0, index_1.getDatabase)(`${process.env.MYSQL_URL}?multipleStatements=true`);
            await (0, testUtility_1.loadSchema)(db, './test/fixture/mysql/initCleanup.sql');
        });
        it('Basic generation', async () => {
            const inputSQLFile = 'test/fixture/mysql/osm.sql';
            const outputFile = './test/actual/mysql/osm.ts';
            const expectedFile = './test/expected/mysql/osm.ts';
            const config = './fixture/mysql/osm.json';
            await (0, testUtility_1.writeTsFile)(inputSQLFile, config, outputFile, db);
            return (0, power_assert_1.default)(await (0, testUtility_1.compare)(expectedFile, outputFile));
        });
        it('Enum conflict in columns', async () => {
            const inputSQLFile = 'test/fixture/mysql/conflict.sql';
            const outputFile = './test/actual/mysql/conflict.ts';
            const config = './fixture/mysql/conflict.json';
            try {
                await (0, testUtility_1.writeTsFile)(inputSQLFile, config, outputFile, db);
            }
            catch (e) {
                power_assert_1.default.equal(e.message, 'Multiple enums with the same name and contradicting types were found: location_type: ["city","province","country"] and ["city","state","country"]');
            }
        });
    });
});
//# sourceMappingURL=schematGeneration.test.js.map