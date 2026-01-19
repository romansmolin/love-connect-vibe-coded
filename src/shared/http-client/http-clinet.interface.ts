import type { AxiosRequestConfig } from 'axios'

import type { ErrorResponseBody } from '../error'

export type HttpRequestConfig<TData = unknown> = AxiosRequestConfig<TData>

export class HttpError extends Error {
    status?: number
    data?: ErrorResponseBody

    constructor(message: string, status?: number, data?: ErrorResponseBody) {
        super(message)
        this.name = 'HttpError'
        this.status = status
        this.data = data
    }
}

export interface HttpClient {
    get<TResponse>(_url: string, _config?: HttpRequestConfig): Promise<TResponse>
    post<TResponse, TBody = unknown>(
        _url: string,
        _body?: TBody,
        _config?: HttpRequestConfig<TBody>
    ): Promise<TResponse>
    put<TResponse, TBody = unknown>(
        _url: string,
        _body?: TBody,
        _config?: HttpRequestConfig<TBody>
    ): Promise<TResponse>
    patch<TResponse, TBody = unknown>(
        _url: string,
        _body?: TBody,
        _config?: HttpRequestConfig<TBody>
    ): Promise<TResponse>
    delete<TResponse>(_url: string, _config?: HttpRequestConfig): Promise<TResponse>
    request<TResponse>(_config: HttpRequestConfig): Promise<TResponse>
}
