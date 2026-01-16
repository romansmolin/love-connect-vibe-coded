'use client'

import React, { useMemo, useState } from 'react'

import { AxiosError } from 'axios'
import { Loader2, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import api from '@/shared/api/axios'
import { GenericCard } from '@/shared/components/generic-card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ForgotPasswordForm = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const isEmailValid = useMemo(() => emailRegex.test(email), [email])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!email || !isEmailValid) {
            toast.error('Please provide a valid email address.')
            return
        }

        try {
            setIsLoading(true)
            await api.post('/auth/password/forgot', { email })
            toast.success('If an account exists for this email, we sent instructions to reset the password.')
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                toast.error(error.response.data?.message ?? 'Unable to process the request right now.')
            } else {
                toast.error('Unable to process the request right now.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const forgotPasswordForm = (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                    autoComplete="email"
                    disabled={isLoading}
                    id="forgot-email"
                    name="email"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                {!isEmailValid && email.length > 0 && (
                    <p className="text-xs text-destructive">Please enter a valid email address.</p>
                )}
            </div>

            <Button className="w-full" disabled={isLoading} size={'lg'} type="submit">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending instructions...
                    </>
                ) : (
                    <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send reset link
                    </>
                )}
            </Button>

            <Button
                className="w-full"
                size={'lg'}
                type="button"
                variant="ghost"
                onClick={() => router.push('/auth')}
            >
                Back to login
            </Button>
        </form>
    )

    return (
        <GenericCard
            cardContent={forgotPasswordForm}
            cardTitle="Forgot Password"
            cardDescription={
                <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
            }
        />
    )
}
