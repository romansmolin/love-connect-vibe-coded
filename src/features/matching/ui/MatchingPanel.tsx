'use client'

import React from 'react'

import { Heart, X } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { useMatchFlow } from '../hooks/use-match-flow'

import type { MatchGender } from './MatchFilters'

const LoadingState = () => (
    <Card className="gap-0 overflow-hidden p-0">
        <Skeleton className="aspect-[3/4] w-full rounded-none" />
        <CardContent className="space-y-3 p-4">
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 flex-1" />
            </div>
        </CardContent>
    </Card>
)

const EmptyState = ({ onRetry }: { onRetry: () => void }) => (
    <Card className="p-5 text-center">
        <p className="text-sm text-muted-foreground">No more profiles to review right now.</p>
        <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>
            Refresh
        </Button>
    </Card>
)

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <Card className="p-5 text-center">
        <p className="text-sm text-destructive">{message}</p>
        <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>
            Try again
        </Button>
    </Card>
)

export const MatchingPanel = ({ city, gender, pool }: { city?: string; gender?: MatchGender; pool?: boolean }) => {
    const { current, isLoading, isActing, error, like, dislike, refetch, remaining } = useMatchFlow({
        city,
        gender,
        pool,
    })

    if (isLoading) {
        return <LoadingState />
    }

    if (error) {
        const message = (error as { data?: { message?: string } })?.data?.message ?? 'Unable to load profiles.'
        return <ErrorState message={message} onRetry={refetch} />
    }

    if (!current) {
        return <EmptyState onRetry={refetch} />
    }

    return (
        <Card className="gap-0 overflow-hidden p-0">
            <Link className="relative block aspect-[3/4] w-full bg-muted" href={`/profile/${current.id}`}>
                {current.photoUrl ? (
                    <img alt={current.username} className="h-full w-full object-cover" src={current.photoUrl} />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted via-background to-muted text-4xl font-semibold text-muted-foreground">
                        {current.username.slice(0, 2).toUpperCase()}
                    </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{current.username}</span>
                        {current.age ? <span className="text-sm">{current.age}</span> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {current.location ? <Badge variant="secondary">{current.location}</Badge> : null}
                        {current.gender ? (
                            <Badge className="uppercase" variant="secondary">
                                {current.gender}
                            </Badge>
                        ) : null}
                        {typeof current.rating === 'number' ? (
                            <Badge variant="secondary">{current.rating.toFixed(1)} / 10</Badge>
                        ) : null}
                    </div>
                </div>
            </Link>
            <CardContent className="space-y-3 p-4">
                <div className="flex gap-2">
                    <Button className="flex-1" disabled={isActing} variant="outline" onClick={dislike}>
                        <X className="mr-2 h-4 w-4" />
                        Nope
                    </Button>
                    <Button className="flex-1" disabled={isActing} onClick={like}>
                        <Heart className="mr-2 h-4 w-4" />
                        Like
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
