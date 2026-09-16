'use client'

import { useState } from 'react'

import { Coins, GiftIcon, Loader2 } from 'lucide-react'

import { useGetCatalogQuery } from '@/entities/gift'
import { creditsFromCents } from '@/shared/lib/credits'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

const getErrorMessage = (error: unknown) => {
    if (error && typeof error === 'object' && 'data' in error) {
        const data = (error as { data?: { message?: string } }).data
        if (data?.message) return data.message
    }
    if (error instanceof Error) return error.message
    return 'Unable to send gift. Please try again.'
}

export const ChatGiftPicker = ({
    disabled,
    onPick,
    onSent,
}: {
    disabled?: boolean
    onPick: (giftId: string) => Promise<void>
    onSent: () => void
}) => {
    const { data, isError, isLoading } = useGetCatalogQuery()
    const [sendingId, setSendingId] = useState<string>()
    const [errorMessage, setErrorMessage] = useState<string>()
    const gifts = data?.items ?? []

    const handlePick = async (giftId: string) => {
        if (disabled || sendingId) return
        setErrorMessage(undefined)
        setSendingId(giftId)
        try {
            await onPick(giftId)
            onSent()
        } catch (error) {
            setErrorMessage(getErrorMessage(error))
        } finally {
            setSendingId(undefined)
        }
    }

    return (
        <div className="w-80 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <GiftIcon className="h-4 w-4 text-primary" />
                Send a gift
            </div>

            {isLoading ? (
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="aspect-square rounded-lg" />
                    ))}
                </div>
            ) : null}

            {isError ? <p className="text-xs text-destructive">Unable to load gifts.</p> : null}
            {!isLoading && !isError && gifts.length === 0 ? (
                <p className="text-xs text-muted-foreground">No gifts are available right now.</p>
            ) : null}

            <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
                {gifts.map((gift) => {
                    const isSending = sendingId === gift.id
                    return (
                        <button
                            key={gift.id}
                            disabled={disabled || Boolean(sendingId)}
                            title={gift.name}
                            type="button"
                            className={cn(
                                'flex min-w-0 flex-col items-center gap-1 rounded-lg border p-2 text-center transition',
                                'hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60'
                            )}
                            onClick={() => handlePick(gift.id)}
                        >
                            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-muted/50">
                                {isSending ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                ) : gift.imageUrl ? (
                                    <img
                                        alt={gift.name}
                                        className="h-full w-full object-contain"
                                        loading="lazy"
                                        src={gift.imageUrl}
                                    />
                                ) : (
                                    <span className="text-3xl">{gift.emoji}</span>
                                )}
                            </div>
                            <span className="w-full truncate text-[11px] font-medium">{gift.name}</span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
                                <Coins className="h-3 w-3" />
                                {creditsFromCents(gift.priceCents)}
                            </span>
                        </button>
                    )
                })}
            </div>

            {errorMessage ? (
                <p className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">{errorMessage}</p>
            ) : null}
        </div>
    )
}
