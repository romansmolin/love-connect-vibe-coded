'use client'

import { useState } from 'react'

import { ArrowLeft, Flag, Gift, Heart, MessageCircle, RefreshCw, ShieldOff, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useBlockUserMutation, useMatchActionMutation, useReportUserMutation } from '@/entities/match'
import { useGetMemberProfileQuery } from '@/entities/user'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'

const REPORT_REASONS = ['Fake profile', 'Inappropriate photos', 'Harassment', 'Spam', 'Underage user', 'Other']

const LoadingState = () => (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
    </div>
)

const ErrorState = ({ message }: { message: string }) => (
    <div className="mx-auto w-full max-w-md">
        <Card className="p-5 text-center">
            <p className="text-sm text-destructive">{message}</p>
            <Button asChild className="mt-3" size="sm" variant="outline">
                <Link href="/matching">Back to Discover</Link>
            </Button>
        </Card>
    </div>
)

const ReportDialog = ({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (reason: string, details: string, code: string) => void
    isSubmitting: boolean
}) => {
    const [reason, setReason] = useState<string | null>(null)
    const [details, setDetails] = useState('')
    const [code, setCode] = useState('')
    const [captchaNonce, setCaptchaNonce] = useState(0)

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    setReason(null)
                    setDetails('')
                    setCode('')
                }
                onOpenChange(next)
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report this profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Select a reason for your report.</p>
                    <div className="flex flex-wrap gap-2">
                        {REPORT_REASONS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                                    reason === option
                                        ? 'border-foreground bg-foreground text-background'
                                        : 'border-border hover:border-foreground/30'
                                }`}
                                onClick={() => setReason(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    <Textarea
                        placeholder="Additional details (optional)"
                        value={details}
                        onChange={(event) => setDetails(event.target.value)}
                    />
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Enter the security code shown below.</p>
                        <div className="flex items-center gap-3">
                            <img
                                alt="Security code"
                                className="h-12 rounded border border-border"
                                src={`/api/match/report/captcha?nonce=${captchaNonce}`}
                            />
                            <Button
                                size="sm"
                                type="button"
                                variant="ghost"
                                onClick={() => setCaptchaNonce((value) => value + 1)}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <Input
                            placeholder="Security code"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        disabled={!reason || !code || isSubmitting}
                        onClick={() => reason && onSubmit(reason, details, code)}
                    >
                        Submit report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const MemberProfilePage = ({ id }: { id: number }) => {
    const router = useRouter()
    const { data, isLoading, error } = useGetMemberProfileQuery(id, { skip: !Number.isFinite(id) || id <= 0 })
    const [matchAction, { isLoading: isActing }] = useMatchActionMutation()
    const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation()
    const [reportUser, { isLoading: isReporting }] = useReportUserMutation()
    const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)

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

    const handleBlock = async () => {
        try {
            await blockUser({ targetId: user.id, action: 'add' }).unwrap()
            toast.success('Profile blocked.')
            setIsBlockConfirmOpen(false)
            router.back()
        } catch (blockError) {
            const message =
                (blockError as { data?: { message?: string } })?.data?.message ?? 'Unable to block this profile.'
            toast.error(message)
        }
    }

    const handleReport = async (reason: string, details: string, code: string) => {
        try {
            await reportUser({ targetId: user.id, reason, code, details: details.trim() || undefined }).unwrap()
            toast.success('Report submitted. Thank you.')
            setIsReportOpen(false)
        } catch (reportError) {
            const message =
                (reportError as { data?: { message?: string } })?.data?.message ?? 'Unable to submit report.'
            toast.error(message)
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <Button className="w-fit" size="sm" variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <Card className="gap-0 overflow-hidden p-0">
                <div className="relative aspect-[3/4] w-full bg-muted/40">
                    {mainPhoto ? (
                        <img alt={user.username} className="h-full w-full object-cover" src={mainPhoto} />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted via-background to-muted text-5xl font-semibold text-muted-foreground">
                            {user.username.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-semibold">{user.username}</span>
                            {user.age ? <span className="text-base">{user.age}</span> : null}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
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
                    <div className="grid grid-cols-4 gap-1.5 p-3">
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

                <CardContent className="space-y-3 p-4">
                    {user.description ? <p className="text-sm text-foreground">{user.description}</p> : null}

                    <div className="flex gap-2">
                        <Button className="flex-1" disabled={isActing} variant="outline" onClick={() => performAction('dislike')}>
                            <X className="mr-2 h-4 w-4" />
                            Nope
                        </Button>
                        <Button className="flex-1" disabled={isActing} onClick={() => performAction('like')}>
                            <Heart className="mr-2 h-4 w-4" />
                            Like
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild className="flex-1" size="sm" variant="outline">
                            <Link href={`/chat?contactId=${user.id}&contact=${encodeURIComponent(user.username)}`}>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Message
                            </Link>
                        </Button>
                        <Button asChild className="flex-1" size="sm" variant="outline">
                            <Link href="/gifts">
                                <Gift className="mr-2 h-4 w-4" />
                                Send a gift
                            </Link>
                        </Button>
                    </div>

                    <div className="flex gap-2 border-t border-border/60 pt-3">
                        <Button
                            className="flex-1 text-muted-foreground"
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsReportOpen(true)}
                        >
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                        </Button>
                        <Button
                            className="flex-1 text-destructive hover:text-destructive"
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsBlockConfirmOpen(true)}
                        >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Block
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={isBlockConfirmOpen} onOpenChange={setIsBlockConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Block {user.username}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You won&apos;t see each other in Discover or matches anymore. You can&apos;t undo this
                            from here.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={isBlocking} onClick={handleBlock}>
                            Block
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ReportDialog
                isSubmitting={isReporting}
                open={isReportOpen}
                onOpenChange={setIsReportOpen}
                onSubmit={handleReport}
            />
        </div>
    )
}
