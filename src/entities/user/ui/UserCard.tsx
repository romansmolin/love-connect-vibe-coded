'use client'

import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { useGetUserProfileQuery } from '../api/client/user.api'

const getInitials = (name?: string) => {
    if (name?.length) return name.slice(0, 2).toUpperCase()
    return '??'
}

const UserCard = () => {
    const { data, isLoading } = useGetUserProfileQuery()

    if (isLoading) {
        return <Skeleton className="h-12 w-full" />
    }

    const displayName = data?.user?.fullName ?? data?.user?.username ?? 'Member'
    const subtitleParts = [data?.user?.age ? `${data.user.age} yrs` : null, data?.user?.location ?? null].filter(
        Boolean
    )

    const subtitle = subtitleParts.length ? subtitleParts.join(' · ') : data?.user?.email
    const initials = getInitials(displayName)

    return (
        <Card className="p-4">
            <CardContent className="flex items-center gap-3 p-0">
                <Avatar>
                    {data?.user?.avatarUrl ? <AvatarImage alt={displayName} src={data.user.avatarUrl} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-none">{displayName}</span>
                    {subtitle ? <span className="text-xs text-muted-foreground">{subtitle}</span> : null}
                </div>
            </CardContent>
        </Card>
    )
}

export { UserCard }
