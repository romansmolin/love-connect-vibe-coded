'use client'

import React, { useMemo, useState } from 'react'

import { AxiosError } from 'axios'
import { Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import api from '@/shared/api/axios'
import { GenericCard } from '@/shared/components/generic-card'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Progress } from '@/shared/ui/progress'

interface ResetPasswordFormProps {
    initialToken?: string
}

export const ResetPasswordForm = ({ initialToken }: ResetPasswordFormProps) => {
    const router = useRouter()

    const [token, setToken] = useState(initialToken ?? '')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const passwordStrength = useMemo(() => {
        if (!newPassword)
            return { label: 'Enter at least 8 characters.', value: 0, variant: 'text-muted-foreground' }

        if (newPassword.length < 8) {
            return { label: 'Password must be at least 8 characters', value: 25, variant: 'text-destructive' }
        }

        if (newPassword.length < 12) {
            return { label: 'Good password strength', value: 60, variant: 'text-yellow-500' }
        }

        return { label: 'Strong password', value: 100, variant: 'text-emerald-500' }
    }, [newPassword])

    const canSubmit =
        token.trim().length > 0 &&
        newPassword.length >= 8 &&
        confirmPassword.length >= 8 &&
        newPassword === confirmPassword &&
        !isLoading

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!token.trim()) {
            toast.error('Reset token is required.')
            return
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters.')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.')
            return
        }

        try {
            setIsLoading(true)
            await api.post('/auth/password/reset', {
                token: token.trim(),
                newPassword,
            })

            toast.success('Password reset successfully. Sign in with your new password.')
            router.push('/auth?reset=success')
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                toast.error(error.response.data?.message ?? 'Unable to reset password.')
            } else {
                toast.error('Unable to reset password.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const resetPasswordForm = (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
                <Label htmlFor="reset-token">Reset Token</Label>
                <Input
                    autoComplete="one-time-code"
                    disabled={isLoading}
                    id="reset-token"
                    name="token"
                    placeholder="tokenId.secret"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                />
                {!token && (
                    <p className="text-xs text-muted-foreground">
                        You can paste the token from the reset email or QA response.
                    </p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                    autoComplete="new-password"
                    disabled={isLoading}
                    id="new-password"
                    name="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                />
                <div className="space-y-1">
                    <Progress value={passwordStrength.value} />
                    <p className={cn('text-xs', passwordStrength.variant)}>{passwordStrength.label}</p>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                    autoComplete="new-password"
                    disabled={isLoading}
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                />
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
            </div>

            <Button className="w-full" disabled={!canSubmit} type="submit">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting password...
                    </>
                ) : (
                    <>
                        <Lock className="mr-2 h-4 w-4" />
                        Reset password
                    </>
                )}
            </Button>

            <Link className="text-center text-sm text-primary underline" href="/forgot-password">
                Didn't receive a token? Try sending it again.
            </Link>
            <Link className="text-center text-sm text-primary underline" href="/auth">
                Back to login
            </Link>
        </form>
    )

    return (
        <GenericCard
            cardContent={resetPasswordForm}
            cardTitle={<span className="text-2xl">Reset Password</span>}
            cardDescription={
                <p className="text-sm text-muted-foreground">
                    Paste the token from your email (or the QA token) and choose a new password.
                </p>
            }
        />
    )
}
