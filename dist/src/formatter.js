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
exports.formatTypescript = void 0;
const ts = __importStar(require("typescript"));
const formatSettings = {
    baseIndentSize: 0,
    indentSize: 4,
    tabSize: 4,
    indentStyle: ts.IndentStyle.Smart,
    newLineCharacter: '\n',
    convertTabsToSpaces: true,
    insertSpaceAfterCommaDelimiter: true,
    insertSpaceAfterSemicolonInForStatements: true,
    insertSpaceBeforeAndAfterBinaryOperators: true,
    insertSpaceAfterConstructor: false,
    insertSpaceAfterKeywordsInControlFlowStatements: true,
    insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
    insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
    insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
    insertSpaceAfterTypeAssertion: false,
    insertSpaceBeforeFunctionParenthesis: false,
    placeOpenBraceOnNewLineForFunctions: false,
    placeOpenBraceOnNewLineForControlBlocks: false,
    insertSpaceBeforeTypeAnnotation: false
};
class FormattingHost {
    constructor(fileName, text) {
        this.getCompilationSettings = () => ts.getDefaultCompilerOptions();
        this.getScriptFileNames = () => [this.fileName];
        this.getScriptVersion = () => '0';
        this.getScriptSnapshot = () => this.snapshot;
        this.getCurrentDirectory = () => process.cwd();
        this.getDefaultLibFileName = (options) => ts.getDefaultLibFilePath(options);
        this.readFile = () => undefined;
        this.fileExists = () => false;
        this.fileName = fileName;
        this.snapshot = ts.ScriptSnapshot.fromString(text);
    }
}
// Reformats generated TypeScript source using the TypeScript language service,
// mirroring the whitespace-only behavior schemats previously got from typescript-formatter.
function formatTypescript(fileName, text) {
    const host = new FormattingHost(fileName, text);
    const languageService = ts.createLanguageService(host);
    const edits = languageService.getFormattingEditsForDocument(fileName, formatSettings);
    let formatted = text;
    edits
        .sort((a, b) => a.span.start - b.span.start)
        .reverse()
        .forEach((edit) => {
        const head = formatted.slice(0, edit.span.start);
        const tail = formatted.slice(edit.span.start + edit.span.length);
        formatted = `${head}${edit.newText}${tail}`;
    });
    if (!formatted.endsWith('\n')) {
        formatted += '\n';
    }
    return formatted;
}
exports.formatTypescript = formatTypescript;
//# sourceMappingURL=formatter.js.map