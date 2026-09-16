'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { ElementType } from 'react'
import { CheckCircle2, CircleAlert, Clock3, Home } from 'lucide-react'

import { Button } from '@/shared/ui/button'

type StatusVariant = 'success' | 'pending' | 'failed'
type AuthoritativeStatus =
    | 'CREATED'
    | 'PENDING'
    | 'SUCCESSFUL'
    | 'FAILED'
    | 'DECLINED'
    | 'EXPIRED'
    | 'ERROR'

const TERMINAL_STATUSES: AuthoritativeStatus[] = [
    'SUCCESSFUL',
    'FAILED',
    'DECLINED',
    'EXPIRED',
    'ERROR',
]

const statusCopy: Record<
    StatusVariant,
    { title: string; description: string; accent: string; icon: ElementType }
> = {
    success: {
        title: 'Payment successful',
        description:
            'Thanks for your payment! Your balance will reflect the purchase shortly.',
        accent:
            'text-green-600 bg-green-50 border-green-100 dark:bg-green-950/40 dark:border-green-900',
        icon: CheckCircle2,
    },
    pending: {
        title: 'Payment pending',
        description:
            'Your payment is being confirmed. We will update your balance once it clears.',
        accent:
            'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900',
        icon: Clock3,
    },
    failed: {
        title: 'Payment not completed',
        description:
            'We could not complete your payment. Please try again or use a different card or method.',
        accent:
            'text-red-600 bg-red-50 border-red-100 dark:bg-red-950/40 dark:border-red-900',
        icon: CircleAlert,
    },
}

const mapAuthoritativeToVariant = (status: AuthoritativeStatus): StatusVariant => {
    if (status === 'SUCCESSFUL') return 'success'
    if (status === 'PENDING' || status === 'CREATED') return 'pending'
    return 'failed'
}

interface PaymentStatusPageProps {
    status: StatusVariant
    token?: string
}

const MAX_POLL_ATTEMPTS = 15
const POLL_INTERVAL_MS = 2000

const PaymentStatusPage = ({ status, token }: PaymentStatusPageProps) => {
    const [variant, setVariant] = useState<StatusVariant>(status)
    const [isResolving, setIsResolving] = useState(Boolean(token))
    const attemptsRef = useRef(0)

    useEffect(() => {
        if (!token) {
            setIsResolving(false)
            return
        }

        const controller = new AbortController()
        let interval: ReturnType<typeof setInterval> | null = null
        let cancelled = false

        const stop = () => {
            if (interval) {
                clearInterval(interval)
                interval = null
            }
            setIsResolving(false)
        }

        const poll = async () => {
            attemptsRef.current += 1
            try {
                const res = await fetch(
                    `/api/payments/secure-processor/${encodeURIComponent(token)}/status`,
                    { signal: controller.signal, cache: 'no-store' },
                )
                if (!res.ok) return
                const data = (await res.json()) as { status?: AuthoritativeStatus }
                const authoritative = data.status
                if (!authoritative || cancelled) return
                setVariant(mapAuthoritativeToVariant(authoritative))
                if (TERMINAL_STATUSES.includes(authoritative)) stop()
            } catch {
                // ignore; polling continues until terminal or max attempts
            } finally {
                if (attemptsRef.current >= MAX_POLL_ATTEMPTS) stop()
            }
        }

        poll()
        interval = setInterval(poll, POLL_INTERVAL_MS)

        return () => {
            cancelled = true
            controller.abort()
            if (interval) clearInterval(interval)
        }
    }, [token])

    const copy = statusCopy[variant]
    const Icon = copy.icon

    return (
        <section className="min-h-[70vh] flex items-center justify-center px-4 py-14">
            <div className="w-full max-w-2xl rounded-2xl border bg-card shadow-sm p-8 text-center space-y-5">
                <div
                    className={`mx-auto inline-flex size-14 items-center justify-center rounded-full border ${copy.accent}`}
                >
                    <Icon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
                    <p className="text-base text-muted-foreground">{copy.description}</p>
                </div>
                {token && (
                    <div className="mx-auto max-w-md rounded-lg border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                        Reference token:{' '}
                        <span className="break-words font-mono text-[11px]">{token}</span>
                    </div>
                )}
                {isResolving && (
                    <p className="text-xs text-muted-foreground">Confirming your payment…</p>
                )}
                <div className="flex flex-wrap justify-center gap-3">
                    <Button asChild size="lg">
                        <Link href="/wallet">Go to wallet</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Back to home
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default PaymentStatusPage
