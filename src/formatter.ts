import * as ts from 'typescript'

const formatSettings: ts.FormatCodeSettings = {
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
}

class FormattingHost implements ts.LanguageServiceHost {
    private readonly fileName: string
    private readonly snapshot: ts.IScriptSnapshot

    constructor (fileName: string, text: string) {
        this.fileName = fileName
        this.snapshot = ts.ScriptSnapshot.fromString(text)
    }

    getCompilationSettings = () => ts.getDefaultCompilerOptions()
    getScriptFileNames = () => [this.fileName]
    getScriptVersion = () => '0'
    getScriptSnapshot = () => this.snapshot
    getCurrentDirectory = () => process.cwd()
    getDefaultLibFileName = (options: ts.CompilerOptions) => ts.getDefaultLibFilePath(options)
    readFile = () => undefined
    fileExists = () => false
}

// Reformats generated TypeScript source using the TypeScript language service,
// mirroring the whitespace-only behavior schemats previously got from typescript-formatter.
export function formatTypescript (fileName: string, text: string): string {
    const host = new FormattingHost(fileName, text)
    const languageService = ts.createLanguageService(host)
    const edits = languageService.getFormattingEditsForDocument(fileName, formatSettings)

    let formatted = text
    edits
        .sort((a, b) => a.span.start - b.span.start)
        .reverse()
        .forEach((edit) => {
            const head = formatted.slice(0, edit.span.start)
            const tail = formatted.slice(edit.span.start + edit.span.length)
            formatted = `${head}${edit.newText}${tail}`
        })

    if (!formatted.endsWith('\n')) {
        formatted += '\n'
    }
    return formatted
}
