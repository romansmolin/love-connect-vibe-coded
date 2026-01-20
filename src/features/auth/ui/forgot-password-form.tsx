'use client'

import { type FormEvent, useState } from 'react'

import { Mail } from 'lucide-react'
import { toast } from 'sonner'

import { useRequestPasswordResetMutation } from '@/entities/user'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('')
    const [requestReset, { isLoading }] = useRequestPasswordResetMutation()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!email.trim()) {
            toast.error('Email is required.')
            return
        }

        try {
            await requestReset({ emailOrUsername: email.trim() }).unwrap()
            toast.success('If this email exists, a reset link will be sent shortly.')
        } catch (error: unknown) {
            const message =
                (error as { data?: { message?: string } })?.data?.message ??
                (error as Error)?.message ??
                'Unable to send reset email.'
            toast.error(message)
        }

        setEmail('')
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                    required
                    autoComplete="email"
                    disabled={isLoading}
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </div>

            <Button className="w-full" disabled={isLoading} type="submit">
                <Mail className="mr-2 h-4 w-4" />
                Send reset link
            </Button>
        </form>
    )
}

export default ForgotPasswordForm
