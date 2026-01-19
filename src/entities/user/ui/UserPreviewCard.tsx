import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Card, CardContent } from '@/shared/ui/card'

import type { UserPreview } from '../model/types'

interface UserPreviewCardProps {
    user: UserPreview
    className?: string
}

const getInitials = (value: string) =>
    value
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

const UserPreviewCard = ({ user, className }: UserPreviewCardProps) => {
    const subtitle = [user.age ? `${user.age} yrs` : null, user.location ?? null].filter(Boolean).join(' · ')

    return (
        <Card className={cn('transition-shadow hover:shadow-md', className)}>
            <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                    {user.avatarUrl ? <AvatarImage alt={user.username} src={user.avatarUrl} /> : null}
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{user.username}</p>
                    {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
                </div>
            </CardContent>
        </Card>
    )
}

export { UserPreviewCard }
