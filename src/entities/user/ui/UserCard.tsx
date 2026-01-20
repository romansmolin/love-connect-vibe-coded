'use client'

import React from 'react'

import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Card, CardContent } from '@/shared/ui/card'
import { useSidebar } from '@/shared/ui/sidebar'
import { Skeleton } from '@/shared/ui/skeleton'

import { useGetUserProfileQuery } from '../api/client/user.api'

const getInitials = (name?: string) => {
    if (name?.length) return name.slice(0, 2).toUpperCase()
    return '??'
}

const UserCard = () => {
    const { data, isLoading } = useGetUserProfileQuery()
    const { state } = useSidebar()
    const isCollapsed = state === 'collapsed'

    if (isLoading) {
        return <Skeleton className={cn('h-12 w-full', isCollapsed && 'mx-auto h-10 w-10')} />
    }

    const displayName = data?.user?.fullName ?? data?.user?.username ?? 'Member'
    const subtitleParts = [data?.user?.age ? `${data.user.age} yrs` : null, data?.user?.location ?? null].filter(
        Boolean
    )

    const subtitle = subtitleParts.length ? subtitleParts.join(' · ') : data?.user?.email
    const initials = getInitials(displayName)

    return (
        <Card className={cn('p-4', isCollapsed && 'p-2')}>
            <CardContent className={cn('flex items-center gap-3 p-0', isCollapsed && 'justify-center')}>
                <Avatar className={cn(isCollapsed && 'h-9 w-9')}>
                    {data?.user?.avatarUrl ? <AvatarImage alt={displayName} src={data.user.avatarUrl} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {!isCollapsed ? (
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-none">{displayName}</span>
                        {subtitle ? <span className="text-xs text-muted-foreground">{subtitle}</span> : null}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    )
}

export { UserCard }
