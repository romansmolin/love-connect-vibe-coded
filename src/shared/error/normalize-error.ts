import { HttpError } from '../http-client/http-clinet.interface'

import { isErrorResponseBody } from './error.types'

export const normalizeSessionError = (err: unknown): HttpError => {
    if (err instanceof HttpError) {
        if (isErrorResponseBody(err.data)) return new HttpError(err.message, err.status, err.data)
        return err
    }

    if (err instanceof Error) return new HttpError(err.message)

    return new HttpError('Unexpected error')
}
