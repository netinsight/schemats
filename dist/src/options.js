"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function camelCase(value) {
    return value
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, char => char.toLowerCase());
}
function upperFirst(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
const DEFAULT_OPTIONS = {
    writeHeader: true,
    camelCase: false
};
class Options {
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }
    transformTypeName(typename) {
        return this.options.camelCase ? upperFirst(camelCase(typename)) : typename;
    }
    transformColumnName(columnName) {
        return this.options.camelCase ? camelCase(columnName) : columnName;
    }
}
exports.default = Options;
//# sourceMappingURL=options.js.map