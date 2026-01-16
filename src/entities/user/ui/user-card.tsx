'use client'

import React from 'react'

import { useGetUserInfoQuery } from '../api/client/user.api'

import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'

export const UserCard = () => {
    const { data, isLoading } = useGetUserInfoQuery()
    const initials = data?.user?.name
        ?.split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <div className={cn('flex items-center gap-3 rounded-xl border border-border/60 p-3')}>
            <Avatar>
                <AvatarFallback>{initials ?? 'LC'}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold">
                    {isLoading ? 'Loading...' : data?.user?.name ?? 'LoveConnect'}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    {data?.user?.email ?? 'member@loveconnect.app'}
                </span>
            </div>
            <Button className="h-8 px-2 text-xs" variant="ghost">
                View
            </Button>
        </div>
    )
}
