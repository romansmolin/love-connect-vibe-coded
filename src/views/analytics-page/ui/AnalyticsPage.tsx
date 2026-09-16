'use client'

import { useMemo } from 'react'

import { Eye, Heart, RefreshCw, Users } from 'lucide-react'
import Link from 'next/link'

import type { RecentVisitorsResponse } from '@/entities/dashboard'
import { useGetMatchesQuery, useGetVotersQuery } from '@/entities/match'
import { useApiFetch } from '@/shared/lib/react/use-api-fetch'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

const StatCard = ({
    label,
    value,
    hint,
    href,
    isLoading,
    icon: Icon,
}: {
    label: string
    value: number
    hint: string
    href: string
    isLoading: boolean
    icon: typeof Users
}) => (
    <Link href={href}>
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    {isLoading ? <Skeleton className="h-9 w-16" /> : <p className="text-3xl font-semibold text-foreground">{value}</p>}
                    <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    </Link>
)

const GENDER_LABELS: Record<string, string> = {
    man: 'Men',
    woman: 'Women',
    couple: 'Couples',
}

export const AnalyticsPage = () => {
    const { data: matchesData, isLoading: isMatchesLoading, refetch: refetchMatches } = useGetMatchesQuery()
    const { data: votersData, isLoading: isVotersLoading, refetch: refetchVoters } = useGetVotersQuery({})
    const {
        data: visitorsData,
        loading: isVisitorsLoading,
        refetch: refetchVisitors,
    } = useApiFetch<RecentVisitorsResponse>('/api/dashboard/recent-visitors')

    const matches = matchesData?.items ?? []
    const voters = votersData?.items ?? []
    const visitors = visitorsData?.items ?? []

    const genderBreakdown = useMemo(() => {
        const counts = new Map<string, number>()
        for (const match of matches) {
            const key = match.gender ?? 'unknown'
            counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        return [...counts.entries()]
            .filter(([key]) => key !== 'unknown')
            .sort((a, b) => b[1] - a[1])
    }, [matches])

    const refetchAll = () => {
        refetchMatches()
        refetchVoters()
        refetchVisitors()
    }

    return (
        <div className="mx-auto w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Analytics</h1>
                    <p className="text-sm text-muted-foreground">How your profile is performing right now.</p>
                </div>
                <Button size="sm" variant="outline" onClick={refetchAll}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    hint="Mutual likes"
                    href="/matches"
                    icon={Heart}
                    isLoading={isMatchesLoading}
                    label="Matches"
                    value={matchesData?.total ?? matches.length}
                />
                <StatCard
                    hint="Voted for your photos"
                    href="/matches"
                    icon={Users}
                    isLoading={isVotersLoading}
                    label="Who liked you"
                    value={voters.length}
                />
                <StatCard
                    hint="Recently checked your profile"
                    href="/dashboard"
                    icon={Eye}
                    isLoading={isVisitorsLoading}
                    label="Recent visitors"
                    value={visitors.length}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Matches by audience</CardTitle>
                    <CardDescription>Who you're matching with, at a glance.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isMatchesLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : genderBreakdown.length === 0 ? (
                        <div className="space-y-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            <p>No matches yet, so there&apos;s nothing to break down.</p>
                            <Link className="font-medium text-primary hover:underline" href="/matching">
                                Start discovering people
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {genderBreakdown.map(([gender, count]) => (
                                <div
                                    key={gender}
                                    className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-3"
                                >
                                    <span className="text-sm font-medium text-foreground">
                                        {GENDER_LABELS[gender] ?? gender}
                                    </span>
                                    <Badge variant="outline">{count}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
