'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

import { AlertTriangle, Mail, Power, Smartphone, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
    useDeleteAccountMutation,
    useGetUserProfileQuery,
    useLogoutMutation,
    useRequestPasswordResetMutation,
    useUpdateProfileMutation,
} from '@/entities/user'
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
            toast.error('Profile is not loaded yet.')
            return
        }
        try {
            await updateProfile({ fullName: defaultFullName, email: email.trim() || undefined }).unwrap()
            toast.success('Email updated')
            refetch()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleSendReset = async () => {
        const target = email.trim() || profile?.email || profile?.username
        if (!target) {
            toast.error('Add an email or username first.')
            return
        }
        try {
            await requestReset({ emailOrUsername: target }).unwrap()
            toast.success('If this account exists, a reset link was sent.')
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleLogout = async () => {
        try {
            await logout().unwrap()
            toast.success('Signed out')
            router.push('/')
            router.refresh()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleDelete = async () => {
        try {
            await deleteAccount(deletePassword ? { password: deletePassword } : undefined).unwrap()
            toast.success('Account deleted')
            router.push('/')
            router.refresh()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-semibold">Settings</CardTitle>
                            <CardDescription className="max-w-2xl">
                                Manage your account details and critical safety actions. Fotochat does not expose
                                privacy or notification settings, so those controls are hidden.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Account Settings
                        </CardTitle>
                        <CardDescription>Update reachable info and reset your password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form className="space-y-3" onSubmit={handleEmailSave}>
                            <div className="space-y-2">
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
                            <Button className="w-full" disabled={savingEmail || profileLoading} type="submit">
                                Save email
                            </Button>
                        </form>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Password</p>
                                    <p className="text-xs text-muted-foreground">
                                        Send yourself a reset link. (Fotochat API uses email token flow)
                                    </p>
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
                        </div>

                        <Separator />

                        <div className="space-y-1 rounded-lg border border-dashed p-3 text-sm">
                            <div className="flex items-center gap-2 font-medium">
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                Phone number
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Phone verification is not available in the Fotochat API.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>Log out or permanently delete your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="delete-pass">Confirm password (optional)</Label>
                            <Input
                                disabled={deleting}
                                id="delete-pass"
                                placeholder="Required if you know it"
                                type="password"
                                value={deletePassword}
                                onChange={(event) => setDeletePassword(event.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full"
                            disabled={deleting}
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            <UserX className="mr-2 h-4 w-4" />
                            Delete account
                        </Button>

                        <Separator />

                        <Button className="w-full" disabled={loggingOut} variant="outline" onClick={handleLogout}>
                            <Power className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
