import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

import type { UserPreview } from '../model/types'

interface UserPreviewCardProps {
    user: UserPreview
    className?: string
    status?: 'matched' | 'pending' | 'liked'
}

const getInitials = (value: string) =>
    value
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

const UserPreviewCard = ({ user, className, status = 'matched' }: UserPreviewCardProps) => {
    const subtitle = [user.age ? `${user.age} yrs` : null, user.location ?? null].filter(Boolean).join(' · ')

    return (
        <Card className={cn('overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg', className)}>
            <CardContent className="flex items-center gap-4 p-4">
                <Link className="shrink-0" href={`/profile/${user.id}`} aria-label={`Open ${user.username}'s profile`}>
                    <Avatar className="h-16 w-16 ring-2 ring-primary/15 ring-offset-2 ring-offset-background">
                        {user.avatarUrl ? <AvatarImage alt={user.username} src={user.avatarUrl} /> : null}
                        <AvatarFallback className="text-base font-semibold">{getInitials(user.username)}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <Link className="truncate text-sm font-semibold text-foreground hover:underline" href={`/profile/${user.id}`}>
                            {user.username}
                        </Link>
                        <Badge
                            className="shrink-0 rounded-full text-[10px]"
                            variant={status === 'pending' ? 'outline' : 'secondary'}
                        >
                            {status === 'pending' ? 'Awaiting reply' : status === 'liked' ? 'Liked you' : 'Matched'}
                        </Badge>
                    </div>
                    {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
                    <Button asChild className="mt-2 h-8 rounded-full px-3" size="sm">
                        <Link href={`/chat?contactId=${user.id}&contact=${encodeURIComponent(user.username)}${user.avatarUrl ? `&avatarUrl=${encodeURIComponent(user.avatarUrl)}` : ''}`}>
                            <MessageCircle className="h-3.5 w-3.5" />
                            Message
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export { UserPreviewCard }
