import { Database } from './schemaInterfaces'
import { PostgresDatabase } from './schemaPostgres'

enum SQLVersion {
    POSTGRES = 1,
    UNKNOWN = 2,
}

function getSQLVersion (connection: string): SQLVersion {
    if (/^postgres(ql)?:\/\//i.test(connection)) {
        return SQLVersion.POSTGRES
    } else {
        return SQLVersion.UNKNOWN
    }
}

export function getDatabase (connection: string): Database {
    switch (getSQLVersion(connection)) {
        case SQLVersion.POSTGRES:
            return new PostgresDatabase(connection)
        default:
            throw new Error(`SQL version unsupported in connection: ${connection}`)
    }
}

export { Database } from './schemaInterfaces'
