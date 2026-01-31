'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Activity, Eye, HeartPulse, RefreshCw, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'

import type { CommunityActivityResponse, RecentVisitorsResponse, TopMembersResponse } from '@/entities/dashboard'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
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
            return 'is celebrating today 🎉'
        case 'friends':
            return 'became friends'
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
            <div key={index} className="flex items-center gap-3">
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

const SectionShell = ({
    title,
    subtitle,
    action,
    children,
}: {
    title: string
    subtitle: string
    action?: React.ReactNode
    children: React.ReactNode
}) => (
    <section className="grid gap-6 border-t border-dashed border-border pt-8 lg:grid-cols-[240px_1fr]">
        <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Section</p>
            <div>
                <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {action}
        </div>
        <div>{children}</div>
    </section>
)

const DashboardHero = () => (
    <div className="rounded-3xl border border-border/70 bg-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
                <Badge className="w-fit rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em]">
                    Your space
                </Badge>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                        <span className="font-pacifico text-primary">Spark</span> real conversations today
                    </h1>
                    <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                        Keep the momentum with fresh matches, quick gestures, and the latest activity around you.
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-6 py-5 text-base font-semibold">
                    <Link href="/matching">
                        <HeartPulse className="h-5 w-5" />
                        Start matching
                    </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6 py-5 text-base">
                    <Link href="/gifts">
                        <Sparkles className="h-5 w-5" />
                        Send a gift
                    </Link>
                </Button>
            </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
                { label: 'New visitors', value: 'Stay visible' },
                { label: 'Top members', value: 'Find standouts' },
                { label: 'Live activity', value: 'Track the buzz' },
            ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
                </div>
            ))}
        </div>
    </div>
)

const ActivityCard = () => {
    const { data, loading, error, refetch } =
        useDashboardFetch<CommunityActivityResponse>('/api/dashboard/activity')

    return (
        <SectionShell
            title="Community activity"
            subtitle="Everything shifting right now."
            action={
                <Button size="sm" variant="outline" className="rounded-full" onClick={refetch}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            }
        >
            {loading ? (
                <ActivitySkeleton />
            ) : error ? (
                <ErrorState message={error} onRetry={refetch} />
            ) : !data || data.items.length === 0 ? (
                <EmptyState message="No activity to show yet. Check back soon." />
            ) : (
                <div className="divide-y divide-border rounded-2xl border border-border/70">
                    {data.items.map((item) => (
                        <div key={item.id} className="flex flex-wrap items-center gap-4 px-4 py-4">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{initials(item.username)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-[180px] flex-1">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <span>{item.username}</span>
                                    {item.gender ? (
                                        <Badge className="rounded-full" variant="outline">
                                            {item.gender}
                                        </Badge>
                                    ) : null}
                                </div>
                                <p className="text-sm text-muted-foreground">{formatAction(item.action)}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {item.location ? `${item.location} · ` : ''}
                                {formatDate(item.timestamp)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SectionShell>
    )
}

const TopMembersCard = () => {
    const [tab, setTab] = useState<'men' | 'women'>('men')
    const path = useMemo(() => `/api/dashboard/top-members?gender=${tab}`, [tab])
    const { data, loading, error, refetch } = useDashboardFetch<TopMembersResponse>(path)

    const list = data?.items ?? []

    return (
        <SectionShell title="Top members" subtitle="Profiles getting the most love right now.">
            <Tabs className="w-full" value={tab} onValueChange={(value) => setTab(value as 'men' | 'women')}>
                <TabsList className="w-full rounded-full border border-border p-1">
                    <TabsTrigger className="rounded-full" value="men">
                        Men
                    </TabsTrigger>
                    <TabsTrigger className="rounded-full" value="women">
                        Women
                    </TabsTrigger>
                </TabsList>
                <TabsContent className="pt-5" value={tab}>
                    {loading ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <MemberSkeleton key={index} />
                            ))}
                        </div>
                    ) : error ? (
                        <ErrorState message={error} onRetry={refetch} />
                    ) : list.length === 0 ? (
                        <EmptyState message="No members found." />
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {list.map((member, index) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-background p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback>{initials(member.username)}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                <span>{member.username}</span>
                                                {member.gender ? (
                                                    <Badge className="uppercase" variant="outline">
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
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">#{index + 1}</p>
                                        <Badge className="rounded-full" variant="outline">
                                            {member.rating}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </SectionShell>
    )
}

const RecentVisitorsCard = () => {
    const { data, loading, error, refetch } = useDashboardFetch<RecentVisitorsResponse>(
        '/api/dashboard/recent-visitors'
    )
    const visitors = data?.items ?? []

    return (
        <SectionShell
            title="Recent visitors"
            subtitle="People who checked your profile."
            action={
                <Button size="sm" variant="outline" className="rounded-full" onClick={refetch}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            }
        >
            {loading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <MemberSkeleton key={index} />
                    ))}
                </div>
            ) : error ? (
                <ErrorState message={error} onRetry={refetch} />
            ) : visitors.length === 0 ? (
                <EmptyState message="No visitors yet." />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {visitors.map((visitor) => (
                        <div
                            key={visitor.id}
                            className="flex items-center justify-between rounded-2xl border border-border/70 bg-background p-4"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-11 w-11">
                                    <AvatarFallback>{initials(visitor.username)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <span>{visitor.username}</span>
                                        {visitor.gender ? (
                                            <Badge className="uppercase" variant="outline">
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
                            <Badge className="rounded-full" variant="outline">
                                {visitor.visitedAt ? formatDate(visitor.visitedAt) : 'Recently'}
                            </Badge>
                        </div>
                    ))}
                </div>
            )}
        </SectionShell>
    )
}

export const DashboardPage = () => {
    return (
        <div className="space-y-10">
            <DashboardHero />
            <ActivityCard />
            <TopMembersCard />
            <RecentVisitorsCard />
        </div>
    )
}
