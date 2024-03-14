"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const DEFAULT_OPTIONS = {
    writeHeader: true,
    camelCase: false
};
class Options {
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }
    transformTypeName(typename) {
        return this.options.camelCase ? (0, lodash_1.upperFirst)((0, lodash_1.camelCase)(typename)) : typename;
    }
    transformColumnName(columnName) {
        return this.options.camelCase ? (0, lodash_1.camelCase)(columnName) : columnName;
    }
}
exports.default = Options;
//# sourceMappingURL=options.js.map