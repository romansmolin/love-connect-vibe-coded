'use client'

import { Heart, MessageCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { useGetVotersQuery } from '@/entities/match'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

const initials = (value: string) => value.slice(0, 2).toUpperCase()

const VotersSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
                <CardContent className="flex items-center gap-3 p-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
)

export const WhoLikedPage = () => {
    const { data, isLoading, error, refetch } = useGetVotersQuery({})
    const voters = data?.items ?? []

    const resolveErrorMessage = (err: unknown) => {
        if (!err || typeof err !== 'object') return 'Unable to load who liked you.'
        const payload = (err as { data?: { message?: string } }).data
        return payload?.message ?? 'Unable to load who liked you.'
    }

    return (
        <div className="mx-auto w-full space-y-6">
            <Card className="bg-primary/5">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl">Who liked you</CardTitle>
                        <CardDescription>People who voted for your photos.</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={refetch}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <VotersSkeleton />
                    ) : error ? (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                            {resolveErrorMessage(error)}
                        </div>
                    ) : voters.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No votes yet. Complete your profile to get more attention.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {voters.map((voter) => (
                                <Card key={voter.id} className="transition-shadow hover:shadow-md">
                                    <CardContent className="flex items-center gap-3 p-4">
                                        <Link
                                            className="flex min-w-0 flex-1 items-center gap-3"
                                            href={`/profile/${voter.id}`}
                                        >
                                            <Avatar className="h-12 w-12">
                                                {voter.photoUrl ? (
                                                    <AvatarImage alt={voter.username} src={voter.photoUrl} />
                                                ) : null}
                                                <AvatarFallback>{initials(voter.username)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {voter.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {[
                                                        voter.age ? `${voter.age} yrs` : null,
                                                        voter.location ?? null,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                            </div>
                                        </Link>
                                        {typeof voter.vote === 'number' ? (
                                            <Badge className="gap-1" variant="secondary">
                                                <Heart className="h-3 w-3" />
                                                {voter.vote}
                                            </Badge>
                                        ) : null}
                                        <Button asChild size="icon" variant="ghost">
                                            <Link
                                                href={`/chat?contactId=${voter.id}&contact=${encodeURIComponent(voter.username)}`}
                                                title={`Message ${voter.username}`}
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
