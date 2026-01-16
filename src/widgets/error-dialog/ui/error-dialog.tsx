'use client'

import { useEffect } from 'react'

import { toast } from 'sonner'

export const ErrorDialog = () => {
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            if (!event.message) return
            toast.error(event.message)
        }

        const handleRejection = (event: PromiseRejectionEvent) => {
            const message =
                event.reason instanceof Error
                    ? event.reason.message
                    : typeof event.reason === 'string'
                      ? event.reason
                      : 'Something went wrong.'
            toast.error(message)
        }

        window.addEventListener('error', handleError)
        window.addEventListener('unhandledrejection', handleRejection)

        return () => {
            window.removeEventListener('error', handleError)
            window.removeEventListener('unhandledrejection', handleRejection)
        }
    }, [])

    return null
}
