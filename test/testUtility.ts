import * as fs from 'node:fs/promises'
import type { Database } from '../src/index'
import * as ts from 'typescript';

export function compile(fileNames: string[], options: ts.CompilerOptions): boolean {
    const program = ts.createProgram(fileNames, options)
    const emitResult = program.emit()
    const exitCode = emitResult.emitSkipped ? 1 : 0
    return exitCode === 0
}

export async function loadSchema(db: Database, file: string) {
    const query = await fs.readFile(file, {
        encoding: 'utf8'
    })
    return await db.query(query)
}
