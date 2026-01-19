'use client'

import { RefreshCw, Users } from 'lucide-react'

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

const StatCard = ({
    label,
    value,
    isLoading,
    icon: Icon,
    hint,
    className,
}: {
    label: string
    value: string
    isLoading: boolean
    icon: typeof Users
    hint?: string
    className?: string
}) => (
    <Card className={className}>
        <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-[0.2em]">{label}</p>
                {isLoading ? (
                    <Skeleton className="h-9 w-20" />
                ) : (
                    <p className="text-3xl font-semibold text-foreground">{value}</p>
                )}
                {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
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
                <StatCard
                    className="sm:col-span-2 lg:col-span-3 bg-primary/5"
                    hint="All mutual likes."
                    icon={Users}
                    isLoading={isLoading}
                    label="Total matches"
                    value={String(total)}
                />
                {/*<StatCard
                    hint="Not available from API."
                    icon={Sparkles}
                    isLoading={isLoading}
                    label="New matches"
                    value="—"
                />
                <StatCard
                    hint="Not available from API."
                    icon={MessageCircle}
                    isLoading={isLoading}
                    label="Active chats"
                    value="—"
                />*/}
            </div>

            <Card className="bg-primary/5">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl">Matches</CardTitle>
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
