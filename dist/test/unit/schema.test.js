"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const schema_1 = require("../../src/schema");
describe('Schema', () => {
    describe('getDatabase', () => {
        it('invalid connection', () => {
            try {
                (0, schema_1.getDatabase)('mongodb://localhost:27017');
            }
            catch (e) {
                assert.equal(e.message, 'SQL version unsupported in connection: mongodb://localhost:27017');
            }
        });
        it('mysql connection', () => {
            const db = (0, schema_1.getDatabase)('mysql://user:password@localhost/test');
            assert.equal(db.constructor.name, 'MysqlDatabase');
        });
        it('postgres connection', () => {
            const db = (0, schema_1.getDatabase)('postgres://user:password@localhost/test');
            assert.equal(db.constructor.name, 'PostgresDatabase');
        });
    });
});
//# sourceMappingURL=schema.test.js.map