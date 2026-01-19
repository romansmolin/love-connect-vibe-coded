'use client'

import { RefreshCw } from 'lucide-react'

import { UserPreviewCard } from '@/entities/user'
import { useMatchesList } from '@/features/matches'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

const resolveErrorMessage = (error: unknown) => {
    if (!error || typeof error !== 'object') return 'Unable to load matches.'
    if ('data' in error) {
        const payload = (error as { data?: { message?: string } }).data
        if (payload?.message) return payload.message
    }
    if ('status' in error) {
        return 'Unable to load matches.'
    }
    return 'Unable to load matches.'
}

const StatCard = ({ label, value, isLoading }: { label: string; value: number; isLoading: boolean }) => (
    <Card>
        <CardContent className="space-y-1 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-semibold">{value}</p>}
        </CardContent>
    </Card>
)

const MatchesSkeleton = () => (
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

export const MatchesOverview = () => {
    const { users, total, isLoading, error, refetch } = useMatchesList()

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard isLoading={isLoading} label="Total matches" value={total} />
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Matches</CardTitle>
                        <CardDescription>People who liked you back.</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={refetch}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <MatchesSkeleton />
                    ) : error ? (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                            {resolveErrorMessage(error)}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No matches yet. Try discovering more profiles.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {users.map((user) => (
                                <UserPreviewCard key={user.id} user={user} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
