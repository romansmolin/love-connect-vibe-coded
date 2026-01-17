'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Activity, ArrowRight, Eye, Flame, RefreshCw, Users } from 'lucide-react'
import Link from 'next/link'

import type {
    CommunityActivityResponse,
    RecentVisitorsResponse,
    TopMembersResponse,
} from '@/entities/dashboard'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type ApiResult<T> = {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => void
}

const useDashboardFetch = <T,>(path: string): ApiResult<T> => {
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

const initials = (value: string) =>
    value
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

const formatAction = (action?: string) => {
    switch (action) {
        case 'con':
            return 'just signed in'
        case 'visite':
            return 'visited a profile'
        case 'vote':
            return 'rated a profile'
        case 'modif':
            return 'updated their profile'
        case 'add_tof':
            return 'added new photos'
        case 'birthday':
            return "is celebrating today 🎉"
        default:
            return 'did something new'
    }
}

const formatDate = (value?: string) => {
    if (!value) return 'just now'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const EmptyState = ({ message }: { message: string }) => (
    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{message}</div>
)

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <span className="truncate">{message}</span>
        <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
        </Button>
    </div>
)

const ActivitySkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
            <div className="flex items-center gap-3" key={index}>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            </div>
        ))}
    </div>
)

const MemberSkeleton = () => (
    <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
        <Skeleton className="h-6 w-16" />
    </div>
)

const StartMatchingCard = () => (
    <Card className="bg-gradient-to-r from-primary/90 to-primary text-white">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-2xl font-bold">Ready to meet someone new?</CardTitle>
                <CardDescription className="text-white/80">
                    Start matching to connect with the best profiles for you.
                </CardDescription>
            </div>
            <Flame className="h-10 w-10" />
        </CardHeader>
        <CardContent>
            <Button asChild className="bg-white text-primary hover:bg-white/90">
                <Link href="/matching">
                    Start matching
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardContent>
    </Card>
)

const ActivityCard = () => {
    const { data, loading, error, refetch } = useDashboardFetch<CommunityActivityResponse>('/api/dashboard/activity')

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Activity className="h-5 w-5 text-primary" />
                            Community Activity
                        </CardTitle>
                        <CardDescription>What&apos;s happening right now</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={refetch}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <ActivitySkeleton />
                ) : error ? (
                    <ErrorState message={error} onRetry={refetch} />
                ) : !data || data.items.length === 0 ? (
                    <EmptyState message="No activity to show yet. Check back soon." />
                ) : (
                    <div className="space-y-3">
                        {data.items.map((item) => (
                            <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3" key={item.id}>
                                <Avatar>
                                    <AvatarFallback>{initials(item.username)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <span>{item.username}</span>
                                        {item.gender ? <Badge variant="outline">{item.gender}</Badge> : null}
                                        {item.location ? (
                                            <span className="text-xs text-muted-foreground">· {item.location}</span>
                                        ) : null}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{formatAction(item.action)}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const TopMembersCard = () => {
    const [tab, setTab] = useState<'men' | 'women'>('men')
    const path = useMemo(() => `/api/dashboard/top-members?gender=${tab}`, [tab])
    const { data, loading, error, refetch } = useDashboardFetch<TopMembersResponse>(path)

    const list = data?.items ?? []

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5 text-primary" />
                    Top Members
                </CardTitle>
                <CardDescription>Browse standout profiles by popularity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs className="w-full" value={tab} onValueChange={(value) => setTab(value as 'men' | 'women')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="men">Men</TabsTrigger>
                        <TabsTrigger value="women">Women</TabsTrigger>
                    </TabsList>
                    <TabsContent value={tab} className="space-y-3 pt-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, index) => <MemberSkeleton key={index} />)
                        ) : error ? (
                            <ErrorState message={error} onRetry={refetch} />
                        ) : list.length === 0 ? (
                            <EmptyState message="No members found." />
                        ) : (
                            list.map((member) => (
                                <div
                                    className="flex items-center justify-between rounded-lg border border-border/70 p-3"
                                    key={member.id}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{initials(member.username)}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                <span>{member.username}</span>
                                                {member.gender ? (
                                                    <Badge variant="outline" className="uppercase">
                                                        {member.gender}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {member.age ? `${member.age} yrs` : 'Age unknown'}
                                                {member.location ? ` · ${member.location}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">
                                        {member.rating ? `${member.rating.toFixed(1)} / 10` : 'New'}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

const RecentVisitorsCard = () => {
    const { data, loading, error, refetch } = useDashboardFetch<RecentVisitorsResponse>('/api/dashboard/recent-visitors')
    const visitors = data?.items ?? []

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Eye className="h-5 w-5 text-primary" />
                            Recent Visitors
                        </CardTitle>
                        <CardDescription>People who checked out your profile</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={refetch}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => <MemberSkeleton key={index} />)
                ) : error ? (
                    <ErrorState message={error} onRetry={refetch} />
                ) : visitors.length === 0 ? (
                    <EmptyState message="No visitors yet." />
                ) : (
                    visitors.map((visitor) => (
                        <div
                            className={cn(
                                'flex items-center justify-between rounded-lg border border-border/60 p-3',
                                'bg-muted/30'
                            )}
                            key={visitor.id}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{initials(visitor.username)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <span>{visitor.username}</span>
                                        {visitor.gender ? (
                                            <Badge variant="outline" className="uppercase">
                                                {visitor.gender}
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {visitor.age ? `${visitor.age} yrs` : 'Age unknown'}
                                        {visitor.location ? ` · ${visitor.location}` : ''}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="secondary">{visitor.visitedAt ? formatDate(visitor.visitedAt) : 'Recently'}</Badge>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

export const DashboardPage = () => {
    return (
        <div className="space-y-6">
            <StartMatchingCard />
            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <ActivityCard />
                </div>
                <div className="space-y-6">
                    <TopMembersCard />
                    <RecentVisitorsCard />
                </div>
            </div>
        </div>
    )
}
