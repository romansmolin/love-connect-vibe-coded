'use client'

import React, { useState } from 'react'

import { Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useSignInMutation } from '@/entities/user'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type Props = {
    thirdPartyAuth?: React.ReactNode
}

const SignInForm = ({ thirdPartyAuth }: Props) => {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [signIn, { isLoading }] = useSignInMutation()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!username || !password) {
            toast.error('Username and password are required.')
            return
        }

        try {
            await signIn({ username, password, rememberMe }).unwrap()
            toast.success('Signed in successfully!')
            router.push('/dashborad')
        } catch (error) {
            const message = (error as { data?: { message?: string } })?.data?.message ?? 'Unable to sign in.'
            toast.error(message)
        }
    }

    return (
        <section className="py-12 md:py-16 overflow-scroll">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 sm:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back to LoveConnect</h2>
                    <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                        Pick up the conversation and keep the momentum going.
                    </p>
                </div>

                <Card className="bg-background/95 shadow-lg max-h-[50%] overflow-scroll">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    required
                                    autoComplete="username"
                                    disabled={isLoading}
                                    id="username"
                                    name="username"
                                    placeholder="your username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
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
                                    onChange={(event) => setPassword(event.target.value)}
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

                            <Button className="w-full" disabled={isLoading} type="submit">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign in
                                    </>
                                )}
                            </Button>
                        </div>

                        {thirdPartyAuth ? (
                            <>
                                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                    <span className="relative z-10 bg-background px-2 text-primary">Or</span>
                                </div>
                                <div>{thirdPartyAuth}</div>
                            </>
                        ) : null}
                    </form>
                </Card>
            </div>
        </section>
    )
}

export default SignInForm
