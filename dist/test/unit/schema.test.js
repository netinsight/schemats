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
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
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