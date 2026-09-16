'use client'

import React, { useMemo, useState } from 'react'

import { HeartPulse, MessageCircle, RefreshCw, Sparkles } from 'lucide-react'
import Link from 'next/link'

import type { RecentVisitorsResponse, TopMembersResponse } from '@/entities/dashboard'
import { useApiFetch as useDashboardFetch } from '@/shared/lib/react/use-api-fetch'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const initials = (value: string) =>
    value
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

const formatDate = (value?: string) => {
    if (!value) return 'just now'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('en-GB', {
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
    <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{subtitle}</CardDescription>
            </div>
            {action}
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
)

const DashboardHero = () => (
    <Card className="p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                    <span className="font-pacifico text-primary">Spark</span> real conversations today
                </h1>
                <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                    Keep the momentum with fresh matches, quick gestures, and the latest activity around you.
                </p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-6 py-5 text-base font-semibold">
                    <Link href="/matching">
                        <HeartPulse className="h-5 w-5" />
                        Start matching
                    </Link>
                </Button>
                <Button asChild className="rounded-full px-6 py-5 text-base" variant="outline">
                    <Link href="/gifts">
                        <Sparkles className="h-5 w-5" />
                        Send a gift
                    </Link>
                </Button>
            </div>
        </div>
    </Card>
)

const TopMembersCard = () => {
    const [tab, setTab] = useState<'men' | 'women'>('men')
    const path = useMemo(() => `/api/dashboard/top-members?gender=${tab}`, [tab])
    const { data, loading, error, refetch } = useDashboardFetch<TopMembersResponse>(path)

    const list = data?.items ?? []

    return (
        <SectionShell subtitle="Profiles getting the most love right now." title="Top members">
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
                                <Link
                                    key={member.id}
                                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-background p-4 transition-colors hover:bg-muted/40"
                                    href={`/profile/${member.id}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            {member.photoUrl ? (
                                                <AvatarImage alt={member.username} src={member.photoUrl} />
                                            ) : null}
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
                                </Link>
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
            subtitle="People who checked your profile."
            title="Recent visitors"
            action={
                <Button className="rounded-full" size="sm" variant="outline" onClick={refetch}>
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
                            className="flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-background p-4 transition-colors hover:bg-muted/40"
                        >
                            <Link
                                className="flex min-w-0 flex-1 items-center gap-3"
                                href={`/profile/${visitor.id}`}
                            >
                                <Avatar className="h-11 w-11">
                                    {visitor.photoUrl ? (
                                        <AvatarImage alt={visitor.username} src={visitor.photoUrl} />
                                    ) : null}
                                    <AvatarFallback>{initials(visitor.username)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <span className="truncate">{visitor.username}</span>
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
                            </Link>
                            <div className="flex items-center gap-2">
                                <Badge className="rounded-full" variant="outline">
                                    {visitor.visitedAt ? formatDate(visitor.visitedAt) : 'Recently'}
                                </Badge>
                                <Button asChild size="icon" variant="ghost">
                                    <Link
                                        href={`/chat?contactId=${visitor.id}&contact=${encodeURIComponent(visitor.username)}${
                                            visitor.photoUrl
                                                ? `&avatarUrl=${encodeURIComponent(visitor.photoUrl)}`
                                                : ''
                                        }`}
                                        title={`Message ${visitor.username}`}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SectionShell>
    )
}

export const DashboardPage = () => {
    return (
        <div className="space-y-6">
            <DashboardHero />
            <TopMembersCard />
            <RecentVisitorsCard />
        </div>
    )
}
