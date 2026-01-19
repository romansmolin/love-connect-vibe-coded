export enum ErrorMessageCode {}

export interface ErrorField {
    field: string
    errorMessageCode: ErrorMessageCode | string
}

export interface ErrorResponseBody {
    errorMessageCode: ErrorMessageCode | string
    httpCode: number
    fields?: ErrorField[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isErrorField = (value: unknown): value is ErrorField => {
    if (!isRecord(value)) return false

    return typeof value.field === 'string' && typeof value.errorMessageCode === 'string'
}

export const isErrorResponseBody = (value: unknown): value is ErrorResponseBody => {
    if (!isRecord(value)) return false

    if (typeof value.errorMessageCode !== 'string') return false
    if (typeof value.httpCode !== 'number') return false

    if (value.fields === undefined) return true
    if (!Array.isArray(value.fields)) return false

    return value.fields.every(isErrorField)
}
