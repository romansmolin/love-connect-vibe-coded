'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

import { KeyRound, Mail, Power, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
    useDeleteAccountMutation,
    useGetUserProfileQuery,
    useLogoutMutation,
    useRequestPasswordResetMutation,
    useUpdateProfileMutation,
} from '@/entities/user'
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
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'

const getErrorMessage = (error: unknown) =>
    (error as { data?: { message?: string } })?.data?.message ??
    (error as Error)?.message ??
    'Something went wrong. Please try again.'

export const SettingsPage = () => {
    const router = useRouter()
    const { data: profileData, isLoading: profileLoading, refetch } = useGetUserProfileQuery()
    const profile = profileData?.user

    const [email, setEmail] = useState('')
    const [deletePassword, setDeletePassword] = useState('')
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    const [updateProfile, { isLoading: savingEmail }] = useUpdateProfileMutation()
    const [requestReset, { isLoading: sendingReset }] = useRequestPasswordResetMutation()
    const [logout, { isLoading: loggingOut }] = useLogoutMutation()
    const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation()

    useEffect(() => {
        setEmail(profile?.email ?? '')
    }, [profile?.email])

    const defaultFullName = useMemo(
        () => profile?.fullName || profile?.username || 'Member',
        [profile?.fullName, profile?.username]
    )

    const handleEmailSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!profile) {
            toast.error('Your profile is still loading. Try again in a moment.')
            return
        }
        try {
            await updateProfile({ fullName: defaultFullName, email: email.trim() || undefined }).unwrap()
            toast.success('Email updated.')
            refetch()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleSendReset = async () => {
        const target = email.trim() || profile?.email || profile?.username
        if (!target) {
            toast.error('Add an email address first.')
            return
        }
        try {
            await requestReset({ emailOrUsername: target }).unwrap()
            toast.success('Reset link sent. Check your inbox.')
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleLogout = async () => {
        try {
            await logout().unwrap()
            toast.success('Signed out.')
            router.push('/')
            router.refresh()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleDelete = async () => {
        try {
            await deleteAccount(deletePassword ? { password: deletePassword } : undefined).unwrap()
            toast.success('Account deleted.')
            router.push('/')
            router.refresh()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsDeleteConfirmOpen(false)
        }
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage how you sign in and your account itself.</p>
            </div>

            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Mail className="h-5 w-5 text-primary" />
                        Email
                    </CardTitle>
                    <CardDescription>Where we&apos;ll reach you and send your password reset link.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleEmailSave}>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                disabled={savingEmail || profileLoading}
                                id="email"
                                placeholder="you@example.com"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>
                        <Button disabled={savingEmail || profileLoading} type="submit">
                            Save
                        </Button>
                    </form>

                    <Separator />

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2">
                            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-foreground">Password</p>
                                <p className="text-xs text-muted-foreground">
                                    We&apos;ll email you a link to set a new one.
                                </p>
                            </div>
                        </div>
                        <Button
                            disabled={sendingReset || profileLoading}
                            size="sm"
                            variant="outline"
                            onClick={handleSendReset}
                        >
                            Send reset link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-lg">Sign out</CardTitle>
                    <CardDescription>End your session on this device.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled={loggingOut} variant="outline" onClick={handleLogout}>
                        <Power className="mr-2 h-4 w-4" />
                        {loggingOut ? 'Signing out…' : 'Sign out'}
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-destructive/30">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-lg text-destructive">Delete account</CardTitle>
                    <CardDescription>
                        Permanently removes your profile, matches, and messages. This can&apos;t be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="delete-pass">Confirm your password</Label>
                        <Input
                            disabled={deleting}
                            id="delete-pass"
                            placeholder="Leave blank if you don't remember it"
                            type="password"
                            value={deletePassword}
                            onChange={(event) => setDeletePassword(event.target.value)}
                        />
                    </div>
                    <Button
                        disabled={deleting}
                        type="button"
                        variant="destructive"
                        onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete my account
                    </Button>
                </CardContent>
            </Card>

            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your profile, matches, and message history will be permanently removed. This can&apos;t
                            be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            {deleting ? 'Deleting…' : 'Delete account'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
