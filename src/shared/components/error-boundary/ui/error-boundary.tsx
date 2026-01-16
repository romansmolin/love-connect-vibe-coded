'use client'

import React from 'react'

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    onError?: (error: Error, info: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

// Lightweight client-side error boundary to isolate failure-prone subtrees.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = {
        hasError: false,
        error: undefined,
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        this.props.onError?.(error, info)
         
        console.error('[ErrorBoundary] caught error', error, info)
    }

    private reset = () => this.setState({ hasError: false, error: undefined })

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }
            return null
        }

        return this.props.children
    }
}
