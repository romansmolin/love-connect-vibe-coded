import axios, { type AxiosInstance } from 'axios'

import { type HttpClient, HttpError, type HttpRequestConfig } from './http-clinet.interface'

const DEFAULT_API_BASE_URL = 'https://api.wikimedia.org'

const createAxiosInstance = (baseURL: string): AxiosInstance =>
    axios.create({
        baseURL,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        timeout: 10000,
    })

const resolveMessage = (payload: unknown): string | undefined => {
    if (typeof payload !== 'object' || payload === null) return undefined

    if ('message' in payload && typeof payload.message === 'string') return payload.message

    if ('error' in payload && typeof payload.error === 'string') return payload.error

    return undefined
}

const mapToHttpError = (error: unknown): HttpError => {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data
        const message = resolveMessage(data) ?? error.message

        return new HttpError(message, status, data)
    }

    if (error instanceof Error) {
        return new HttpError(error.message)
    }

    return new HttpError('Unexpected HTTP error')
}

const request = async <TResponse>(
    executor: () => Promise<TResponse>,
    mapError: (error: unknown) => HttpError | Promise<HttpError> = mapToHttpError,
    transformErrorMessage?: (message: string) => string | Promise<string>
): Promise<TResponse> => {
    try {
        return await executor()
    } catch (error) {
        const mappedError = await mapError(error)

        if (transformErrorMessage) {
            try {
                mappedError.message = await transformErrorMessage(mappedError.message)
            } catch {
                // Keep the original upstream message when translation is unavailable.
            }
        }

        throw mappedError
    }
}

type AxiosHttpClientOptions = {
    baseURL?: string
    instance?: AxiosInstance
    mapError?: (error: unknown) => HttpError | Promise<HttpError>
    transformErrorMessage?: (message: string) => string | Promise<string>
}

class AxiosHttpClient implements HttpClient {
    private readonly axiosInstance: AxiosInstance
    private readonly mapError: (error: unknown) => HttpError | Promise<HttpError>
    private readonly transformErrorMessage?: (message: string) => string | Promise<string>

    constructor({
        baseURL = DEFAULT_API_BASE_URL,
        instance,
        mapError = mapToHttpError,
        transformErrorMessage,
    }: AxiosHttpClientOptions = {}) {
        this.axiosInstance = instance ?? createAxiosInstance(baseURL)
        this.mapError = mapError
        this.transformErrorMessage = transformErrorMessage
    }

    private execute<TResponse>(executor: () => Promise<TResponse>) {
        return request(executor, this.mapError, this.transformErrorMessage)
    }

    get<TResponse>(url: string, config?: HttpRequestConfig) {
        return this.execute(async () => {
            const response = await this.axiosInstance.get<TResponse>(url, config)
            return response.data
        })
    }

    post<TResponse, TBody = unknown>(url: string, body?: TBody, config?: HttpRequestConfig<TBody>) {
        return this.execute(async () => {
            const response = await this.axiosInstance.post<TResponse>(url, body, config)
            return response.data
        })
    }

    put<TResponse, TBody = unknown>(url: string, body?: TBody, config?: HttpRequestConfig<TBody>) {
        return this.execute(async () => {
            const response = await this.axiosInstance.put<TResponse>(url, body, config)
            return response.data
        })
    }

    patch<TResponse, TBody = unknown>(url: string, body?: TBody, config?: HttpRequestConfig<TBody>) {
        return this.execute(async () => {
            const response = await this.axiosInstance.patch<TResponse>(url, body, config)
            return response.data
        })
    }

    delete<TResponse>(url: string, config?: HttpRequestConfig) {
        return this.execute(async () => {
            const response = await this.axiosInstance.delete<TResponse>(url, config)
            return response.data
        })
    }

    request<TResponse>(config: HttpRequestConfig) {
        return this.execute(async () => {
            const response = await this.axiosInstance.request<TResponse>(config)
            return response.data
        })
    }
}

const axiosInstance = createAxiosInstance(DEFAULT_API_BASE_URL)

export const createHttpClient = (baseURL = DEFAULT_API_BASE_URL): HttpClient => new AxiosHttpClient({ baseURL })

export const httpClient: HttpClient = new AxiosHttpClient({ instance: axiosInstance })

export { axiosInstance, AxiosHttpClient, DEFAULT_API_BASE_URL }
