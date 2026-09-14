'use client'

import { ArrowLeft, Gift, Heart, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useMatchActionMutation } from '@/entities/match'
import { useGetMemberProfileQuery } from '@/entities/user'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

const LoadingState = () => (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
    </div>
)

const ErrorState = ({ message }: { message: string }) => (
    <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 text-center">
            <p className="text-sm text-destructive">{message}</p>
            <Button asChild className="mt-4" variant="outline">
                <Link href="/matching">Back to Discover</Link>
            </Button>
        </Card>
    </div>
)

export const MemberProfilePage = ({ id }: { id: number }) => {
    const router = useRouter()
    const { data, isLoading, error } = useGetMemberProfileQuery(id, { skip: !Number.isFinite(id) || id <= 0 })
    const [matchAction, { isLoading: isActing }] = useMatchActionMutation()

    if (isLoading) {
        return <LoadingState />
    }

    if (error || !data?.user) {
        const message =
            (error as { data?: { message?: string } })?.data?.message ?? 'Unable to load this profile.'
        return <ErrorState message={message} />
    }

    const { user } = data
    const mainPhoto = user.photos?.[0]?.urlLarge ?? user.photos?.[0]?.urlMedium ?? user.avatarUrl

    const performAction = async (action: 'like' | 'dislike') => {
        try {
            const response = await matchAction({ action, userId: user.id }).unwrap()
            if (response.isMatch) {
                toast.success("It's a match!")
            } else {
                toast.success(action === 'like' ? 'Liked!' : 'Passed.')
            }
            router.back()
        } catch (actionError) {
            const message =
                (actionError as { data?: { message?: string } })?.data?.message ?? 'Unable to update match.'
            toast.error(message)
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <Button className="w-fit" size="sm" variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <Card className="overflow-hidden">
                <div className="relative aspect-[4/5] w-full bg-muted/40">
                    {mainPhoto ? (
                        <img alt={user.username} className="h-full w-full object-cover" src={mainPhoto} />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted via-background to-muted text-5xl font-semibold text-muted-foreground">
                            {user.username.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold">{user.username}</span>
                            {user.age ? <span className="text-lg">{user.age}</span> : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {user.location ? <Badge variant="secondary">{user.location}</Badge> : null}
                            {user.gender ? (
                                <Badge className="uppercase" variant="secondary">
                                    {user.gender}
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                </div>

                {user.photos && user.photos.length > 1 ? (
                    <div className="grid grid-cols-4 gap-2 p-4">
                        {user.photos.slice(1, 5).map((photo, index) => {
                            const src = photo.urlMedium ?? photo.urlSmall ?? photo.urlLarge
                            if (!src) return null
                            return (
                                <img
                                    key={index}
                                    alt={`${user.username} ${index + 2}`}
                                    className="aspect-square w-full rounded-lg object-cover"
                                    src={src}
                                />
                            )
                        })}
                    </div>
                ) : null}

                <CardContent className="space-y-4 p-6">
                    {user.description ? <p className="text-sm text-foreground">{user.description}</p> : null}

                    <div className="flex gap-3">
                        <Button className="flex-1" disabled={isActing} variant="outline" onClick={() => performAction('dislike')}>
                            <X className="mr-2 h-4 w-4" />
                            Nope
                        </Button>
                        <Button className="flex-1" disabled={isActing} onClick={() => performAction('like')}>
                            <Heart className="mr-2 h-4 w-4" />
                            Like
                        </Button>
                    </div>
                    <Button asChild className="w-full" variant="outline">
                        <Link href="/gifts">
                            <Gift className="mr-2 h-4 w-4" />
                            Send a gift
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
