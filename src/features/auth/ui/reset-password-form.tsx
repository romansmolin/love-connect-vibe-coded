'use client'

import { type FormEvent, useState } from 'react'

import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface ResetPasswordFormProps {
    initialToken?: string
}

const ResetPasswordForm = ({ initialToken }: ResetPasswordFormProps) => {
    const [token, setToken] = useState(initialToken ?? '')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!token.trim()) {
            toast.error('Reset token is required.')
            return
        }

        if (!password || password.length < 6) {
            toast.error('Please enter a password with at least 6 characters.')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.')
            return
        }

        setIsSubmitting(true)

        try {
            toast.success('Your password has been reset. You can now sign in.')
            setPassword('')
            setConfirmPassword('')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="token">Reset token</Label>
                <Input
                    required
                    disabled={isSubmitting}
                    id="token"
                    name="token"
                    placeholder="Paste your reset token"
                    type="text"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                    required
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                    required
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                />
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
                <KeyRound className="mr-2 h-4 w-4" />
                Reset password
            </Button>
        </form>
    )
}

export default ResetPasswordForm
