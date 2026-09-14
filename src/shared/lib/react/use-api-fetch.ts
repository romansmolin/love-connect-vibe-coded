import { useCallback, useEffect, useState } from 'react'

export type ApiFetchResult<T> = {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => void
}

export const useApiFetch = <T,>(path: string): ApiFetchResult<T> => {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [nonce, setNonce] = useState(0)

    const refetch = useCallback(() => setNonce((value) => value + 1), [])

    useEffect(() => {
        let active = true
        const run = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await fetch(path, { cache: 'no-store' })
                const json = await response.json()
                if (!active) return

                if (!response.ok || json?.ok === false) {
                    const message = json?.message ?? 'Something went wrong.'
                    throw new Error(message)
                }

                setData(json as T)
            } catch (err) {
                if (!active) return
                const message = (err as Error)?.message ?? 'Unable to load data.'
                setError(message)
                setData(null)
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        run()

        return () => {
            active = false
        }
    }, [nonce, path])

    return { data, loading, error, refetch }
}
