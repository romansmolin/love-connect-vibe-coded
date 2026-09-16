import { AppError, FieldError } from './app-error'
import { ErrorCode } from './error-codes'

const mapStatusToCode = (statusCode: number): ErrorCode => {
    if (statusCode === 400) return ErrorCode.VALIDATION_ERROR
    if (statusCode === 401) return ErrorCode.INVALID_CREDENTIALS
    if (statusCode === 403) return ErrorCode.FORBIDDEN
    if (statusCode === 404) return ErrorCode.NOT_FOUND
    if (statusCode === 409) return ErrorCode.CONFLICT
    return ErrorCode.INTERNAL_ERROR
}

export class HttpError extends AppError {
    constructor(
        message: string,
        statusCode: number,
        fields?: FieldError[],
        translatable = false,
    ) {
        super(message, mapStatusToCode(statusCode), statusCode, fields, true, translatable)
    }
}
