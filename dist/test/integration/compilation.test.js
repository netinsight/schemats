"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const testUtility_1 = require("../testUtility");
describe('end user use case', () => {
    it('usecase.ts should compile without error', () => {
        (0, testUtility_1.compile)(['fixture/usecase.ts'], {
            noEmitOnError: true,
            noImplicitAny: true,
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS
        });
    });
});
//# sourceMappingURL=compilation.test.js.map