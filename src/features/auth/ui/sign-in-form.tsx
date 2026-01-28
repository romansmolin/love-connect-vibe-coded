'use client'

import React, { JSX, useState } from 'react'

import { Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useSignInMutation } from '@/entities/user'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const SignInForm = ({ thirdPartyAuth }: { thirdPartyAuth?: JSX.Element }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [consentAccepted, setConsentAccepted] = useState(false)
    const [signIn, { isLoading }] = useSignInMutation()
    const router = useRouter()

    const handleSignIn = async () => {
        if (!username || !password) {
            toast.error('Username and password are required.')
            return
        }

        if (!consentAccepted) {
            toast.error('Please accept the Terms, Privacy Policy, and Return Policy to continue.')
            return
        }

        try {
            await signIn({ username, password, rememberMe }).unwrap()

            toast.success('Signed in successfully!')

            router.push('/dashborad')
        } catch (error) {
            const message = (error as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.'
            toast.error(message)
            console.error('Sign-in error:', error)
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                handleSignIn()
            }}
        >
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            required
                            autoComplete="username"
                            disabled={isLoading}
                            id="username"
                            name="username"
                            placeholder="loveconnect"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            required
                            autoComplete="current-password"
                            disabled={isLoading}
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Link className="text-xs text-primary underline" href="/forgot-password">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Checkbox
                                checked={rememberMe}
                                disabled={isLoading}
                                onCheckedChange={(value) => setRememberMe(Boolean(value))}
                            />
                            Remember me
                        </label>
                    </div>

                    <div className="flex items-start gap-2">
                        <Checkbox
                            checked={consentAccepted}
                            disabled={isLoading}
                            id="sign-in-consent"
                            onCheckedChange={(value) => setConsentAccepted(Boolean(value))}
                        />
                        <Label className="text-sm text-muted-foreground" htmlFor="sign-in-consent">
                            I agree to the{' '}
                            <Link className="underline hover:text-primary" href="/terms-of-service">
                                Terms of Service
                            </Link>
                            ,{' '}
                            <Link className="underline hover:text-primary" href="/privacy-policy">
                                Privacy Policy
                            </Link>
                            , and{' '}
                            <Link className="underline hover:text-primary" href="/return-policy">
                                Return Policy
                            </Link>
                            .
                        </Label>
                    </div>

                    <Button className="w-full" disabled={isLoading} type="submit">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Login
                            </>
                        )}
                    </Button>
                </div>

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-primary">Or</span>
                </div>
                <div>{thirdPartyAuth}</div>
            </div>
        </form>
    )
}

export default SignInForm
