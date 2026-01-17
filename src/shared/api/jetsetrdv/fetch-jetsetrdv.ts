import { type NextFetchRequestConfig } from 'next/server'

export class JetsetRdvError extends Error {
    status: number
    data?: unknown

    constructor(message: string, status: number, data?: unknown) {
        super(message)
        this.status = status
        this.data = data
    }
}

type QueryValue = string | number | boolean | null | undefined

type FetchJetsetRdvOptions = {
    path: string
    method?: 'GET' | 'POST'
    query?: Record<string, QueryValue>
    body?: Record<string, QueryValue> | unknown
    headers?: HeadersInit
    cache?: RequestCache
    next?: NextFetchRequestConfig
}

const ensurePath = (path: string) => {
    if (path.includes('://')) {
        throw new JetsetRdvError('Invalid JetSetRDV path.', 400)
    }
    return path.startsWith('/') ? path : `/${path}`
}

export const fetchJetsetRdv = async <TResponse>(options: FetchJetsetRdvOptions): Promise<TResponse> => {
    const apiUrl = process.env.API_URL
    const apiKey = process.env.API_KEY

    if (!apiUrl || !apiKey) {
        throw new JetsetRdvError('JetSetRDV API is not configured.', 500)
    }

    const path = ensurePath(options.path)
    const url = new URL(apiUrl)
    url.pathname = `${url.pathname.replace(/\/$/, '')}${path}`

    const params = new URLSearchParams()
    params.set('api_key', apiKey)

    if (options.query) {
        Object.entries(options.query).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            params.set(key, String(value))
        })
    }

    url.search = params.toString()

    const headers: HeadersInit = {
        Accept: 'application/json',
        ...options.headers,
    }

    const hasBody = options.body !== undefined && options.body !== null
    const contentType =
        typeof headers['Content-Type'] === 'string'
            ? headers['Content-Type']
            : Array.isArray(headers['Content-Type'])
              ? headers['Content-Type'][0]
              : null

    let body: BodyInit | undefined
    if (hasBody) {
        if (contentType?.includes('application/x-www-form-urlencoded')) {
            const form = new URLSearchParams()
            Object.entries(options.body as Record<string, QueryValue>).forEach(([key, value]) => {
                if (value === undefined || value === null) return
                form.set(key, String(value))
            })
            body = form.toString()
        } else {
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(options.body)
        }
    }

    const response = await fetch(url.toString(), {
        method: options.method ?? 'GET',
        headers,
        body,
        cache: options.cache ?? 'no-store',
        next: options.next,
    })

    const text = await response.text()
    let data: unknown = null
    try {
        data = text ? JSON.parse(text) : null
    } catch {
        data = text
    }

    if (!response.ok) {
        const payloadMessage =
            (data as { message?: string })?.message ||
            (typeof data === 'string' && data.trim().length > 0 ? data : null)

        const message = payloadMessage || response.statusText || 'JetSetRDV request failed.'
        throw new JetsetRdvError(message, response.status, data)
    }

    if (data === null || data === undefined) {
        throw new JetsetRdvError('Empty response from JetSetRDV.', response.status || 502, data)
    }

    return data as TResponse
}
