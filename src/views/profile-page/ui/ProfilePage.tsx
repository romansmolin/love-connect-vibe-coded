'use client'

import { type ElementType, useMemo } from 'react'

import { ArrowUpRight, Camera, CheckCircle, Heart, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { useGetUserProfileQuery } from '@/entities/user'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

const initials = (value?: string) => (value ? value.slice(0, 2).toUpperCase() : '??')

const StatusDot = ({ status }: { status: 'online' | 'offline' }) => (
    <span
        className={cn(
            'flex h-2.5 w-2.5 items-center justify-center rounded-full',
            status === 'online' ? 'bg-emerald-500' : 'bg-muted-foreground/40'
        )}
    />
)

const InfoSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-24" />
    </div>
)

const PhotoGrid = ({ photos }: { photos: { urlSmall?: string; urlMedium?: string; urlLarge?: string }[] }) => {
    if (!photos.length) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-card/40 text-sm text-muted-foreground">
                <Camera className="mb-2 h-6 w-6" />
                <p>No photos yet. Add some to get more attention.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.slice(0, 6).map((photo, idx) => (
                <div
                    key={idx}
                    className="group relative overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm"
                >
                    <div
                        className="aspect-square bg-muted"
                        style={{
                            backgroundImage: photo.urlMedium ? `url(${photo.urlMedium})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                </div>
            ))}
        </div>
    )
}

const QuickAction = ({
    title,
    description,
    href,
    color,
    icon: Icon,
}: {
    title: string
    description: string
    href: string
    color: 'red' | 'purple' | 'blue' | 'gray'
    icon: ElementType
}) => {
    const colorClasses: Record<'red' | 'purple' | 'blue' | 'gray', string> = {
        red: 'bg-red-50 text-red-900 border-red-100',
        purple: 'bg-violet-50 text-violet-900 border-violet-100',
        blue: 'bg-sky-50 text-sky-900 border-sky-100',
        gray: 'bg-muted text-foreground border-border',
    }

    return (
        <Link
            href={href}
            className={cn(
                'flex flex-col gap-1 rounded-xl border p-4 transition hover:shadow-sm',
                colorClasses[color]
            )}
        >
            <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4" />
                {title}
            </div>
            <p className="text-xs opacity-80">{description}</p>
        </Link>
    )
}

export const ProfilePage = () => {
    const { data, isLoading } = useGetUserProfileQuery()
    const profile = data?.user

    const profileCompletion = useMemo(() => {
        if (!profile) return '--'
        const photoScore = Math.min((profile.photos?.length ?? 0) * 10, 40)
        const fieldsScore = 60 // placeholder until API exposes more completeness data
        return `${Math.min(photoScore + fieldsScore, 100)}%`
    }, [profile])

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <Card className="border-primary/10">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            {profile?.avatarUrl ? (
                                <AvatarImage alt={profile.username} src={profile.avatarUrl} />
                            ) : null}
                            <AvatarFallback className="text-lg font-semibold">
                                {initials(profile?.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            {isLoading ? (
                                <InfoSkeleton />
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold">{profile?.username ?? 'My Profile'}</h1>
                                        <Badge className="gap-1" variant="outline">
                                            <StatusDot status="online" /> Online now
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {profile?.age ? `${profile.age} yrs` : '-- years'} •{' '}
                                        {profile?.location ?? 'Location'}
                                    </p>
                                    {profile?.email ? (
                                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>
                    <Button variant="outline">
                        Edit Profile
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <Card className="border-primary/10">
                    <CardHeader>
                        <CardTitle>Your Photos</CardTitle>
                        <CardDescription>Show your best shots to get more matches.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <Skeleton key={idx} className="aspect-square rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <PhotoGrid photos={profile?.photos ?? []} />
                        )}
                        <div className="flex items-center justify-between rounded-lg border border-dashed border-border/60 bg-card/40 px-4 py-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span>Profile completion</span>
                            </div>
                            <span className="font-semibold">{profileCompletion}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/10">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Jump into key flows.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <QuickAction
                            color="red"
                            description="Find new people nearby"
                            href="/matching"
                            icon={Sparkles}
                            title="Start Discovering"
                        />
                        <QuickAction
                            color="blue"
                            description="Check your conversations"
                            href="/chat"
                            icon={MessageCircle}
                            title="Check Messages"
                        />
                        <QuickAction
                            color="purple"
                            description="See who likes you"
                            href="/matches"
                            icon={Heart}
                            title="View Matches"
                        />
                        <QuickAction
                            color="gray"
                            description="Manage your account"
                            href="/dashboard"
                            icon={ArrowUpRight}
                            title="Settings"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
