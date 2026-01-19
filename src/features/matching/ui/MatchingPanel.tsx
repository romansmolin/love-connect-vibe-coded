'use client'

import React from 'react'

import { Heart, X } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { useMatchFlow } from '../hooks/use-match-flow'

const LoadingState = () => (
    <Card className="overflow-hidden">
        <Skeleton className="h-72 w-full" />
        <CardContent className="space-y-4 p-6">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <div className="flex gap-3">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
            </div>
        </CardContent>
    </Card>
)

const EmptyState = ({ onRetry }: { onRetry: () => void }) => (
    <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">No more profiles to review right now.</p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
            Refresh
        </Button>
    </Card>
)

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <Card className="p-6 text-center">
        <p className="text-sm text-destructive">{message}</p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
            Try again
        </Button>
    </Card>
)

export const MatchingPanel = () => {
    const { current, isLoading, isActing, error, like, dislike, refetch, remaining } = useMatchFlow()

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
        <Card className="overflow-hidden">
            <div className="p-4">
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/40 shadow-sm">
                    <div className="aspect-[4/5] w-full">
                        {current.photoUrl ? (
                            <img
                                alt={current.username}
                                className="h-full w-full object-cover"
                                src={current.photoUrl}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted via-background to-muted text-4xl font-semibold text-muted-foreground">
                                {current.username.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
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
                </div>
            </div>
            <CardContent className="space-y-4 p-6">
                <div className="text-xs text-muted-foreground">
                    {remaining > 0 ? `${remaining} profiles in this batch` : 'No more profiles in this batch'}
                </div>
                <div className="flex gap-3">
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
