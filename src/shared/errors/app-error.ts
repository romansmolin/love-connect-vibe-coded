import { BaseError } from './base-error'
import { ErrorCode } from './error-codes'

export interface FieldError {
    field: string
    message: string
}

export class AppError extends BaseError {
    public readonly fields?: FieldError[]
    public readonly translatable: boolean

    constructor(
        message: string,
        code: ErrorCode,
        statusCode: number,
        fields?: FieldError[],
        isOperational = true,
        translatable = false,
    ) {
        super(message, code, statusCode, isOperational)
        this.fields = fields
        this.translatable = translatable
    }

    static validationError(message: string, fields?: FieldError[]): AppError {
        return new AppError(message, ErrorCode.VALIDATION_ERROR, 400, fields)
    }

    static authenticationError(message = 'Authentication required'): AppError {
        return new AppError(message, ErrorCode.AUTH_REQUIRED, 401)
    }

    static authorizationError(message = 'Access forbidden'): AppError {
        return new AppError(message, ErrorCode.FORBIDDEN, 403)
    }

    static notFoundError(message = 'Resource not found'): AppError {
        return new AppError(message, ErrorCode.NOT_FOUND, 404)
    }

    static conflictError(message: string): AppError {
        return new AppError(message, ErrorCode.CONFLICT, 409)
    }

    static internalError(message = 'Internal server error'): AppError {
        return new AppError(message, ErrorCode.INTERNAL_ERROR, 500, undefined, false)
    }
}
