function camelCase (value: string): string {
    return value
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
        .replace(/^[A-Z]/, char => char.toLowerCase())
}

function upperFirst (value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

const DEFAULT_OPTIONS: OptionValues = {
    writeHeader: true,
    camelCase: false
}

export type OptionValues = {
    camelCase?: boolean
    writeHeader?: boolean // write schemats description header
}

export default class Options {
    public options: OptionValues

    constructor (options: OptionValues = {}) {
        this.options = {...DEFAULT_OPTIONS, ...options}
    }

    transformTypeName (typename: string) {
        return this.options.camelCase ? upperFirst(camelCase(typename)) : typename
    }

    transformColumnName (columnName: string) {
        return this.options.camelCase ? camelCase(columnName) : columnName
    }
}
