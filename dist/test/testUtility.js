"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeTsFile = exports.loadSchema = exports.compare = exports.compile = void 0;
const fs = require("node:fs/promises");
const index_1 = require("../src/index");
const ts = require("typescript");
const diff = require('diff');
function compile(fileNames, options) {
    let program = ts.createProgram(fileNames, options);
    let emitResult = program.emit();
    let exitCode = emitResult.emitSkipped ? 1 : 0;
    return exitCode === 0;
}
exports.compile = compile;
async function compare(goldStandardFile, outputFile) {
    let gold = await fs.readFile(goldStandardFile, { encoding: 'utf8' });
    let actual = await fs.readFile(outputFile, { encoding: 'utf8' });
    let diffs = diff.diffLines(gold, actual, { ignoreWhitespace: true, newlineIsToken: true });
    const addOrRemovedLines = diffs.filter((d) => d.added || d.removed);
    if (addOrRemovedLines.length > 0) {
        console.error(`Generated type definition different to the standard ${goldStandardFile}`);
        addOrRemovedLines.forEach((d, i) => {
            const t = d.added ? '+' : d.removed ? '-' : 'x';
            console.error(`  [${i}] ${t} ${d.value}`);
        });
        return false;
    }
    else {
        return true;
    }
}
exports.compare = compare;
async function loadSchema(db, file) {
    let query = await fs.readFile(file, {
        encoding: 'utf8'
    });
    return await db.query(query);
}
exports.loadSchema = loadSchema;
async function writeTsFile(inputSQLFile, inputConfigFile, outputFile, db) {
    await loadSchema(db, inputSQLFile);
    const config = require(inputConfigFile);
    let formattedOutput = await (0, index_1.typescriptOfSchema)(db, config.tables, config.schema, { camelCase: config.camelCase, writeHeader: config.writeHeader });
    await fs.writeFile(outputFile, formattedOutput);
}
exports.writeTsFile = writeTsFile;
//# sourceMappingURL=testUtility.js.map