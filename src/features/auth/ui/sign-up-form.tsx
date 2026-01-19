'use client'

import React, { JSX, useState } from 'react'

import { Loader2, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useSignUpMutation } from '@/entities/user'
import type { Gender, LookingFor } from '@/entities/user'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const SignUpForm = ({ thirdPartyAuth }: { thirdPartyAuth?: JSX.Element }) => {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [gender, setGender] = useState<Gender | ''>('')
    const [lookingFor, setLookingFor] = useState<LookingFor | ''>('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [city, setCity] = useState('')
    const [signUp, { isLoading }] = useSignUpMutation()
    const router = useRouter()

    const handleSignUp = async () => {
        if (!name || !email || !password || !username || !gender || !lookingFor || !dateOfBirth || !city) {
            toast.error('All fields are required.')
            return
        }

        try {
            await signUp({
                name,
                email,
                password,
                username,
                gender,
                lookingFor,
                dateOfBirth,
                city,
            }).unwrap()
            toast.success('Signed up successfully!')
            router.push('/dashborad')
        } catch (error) {
            const message = (error as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.'
            toast.error(message)
            console.error('Credentials authentication failed:', error)
        }
    }

    return (
        <form
            className="h-full"
            onSubmit={(event) => {
                event.preventDefault()
                handleSignUp()
            }}
        >
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            required
                            disabled={isLoading}
                            id="name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

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
                        <Label htmlFor="email">Email</Label>
                        <Input
                            required
                            autoComplete="email"
                            disabled={isLoading}
                            id="email"
                            name="email"
                            placeholder="m@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            required
                            autoComplete="new-password"
                            disabled={isLoading}
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            disabled={isLoading}
                            value={gender}
                            onValueChange={(value) => setGender(value as Gender)}
                        >
                            <SelectTrigger className="w-full" id="gender">
                                <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="woman">Woman</SelectItem>
                                <SelectItem value="man">Man</SelectItem>
                                <SelectItem value="non_binary">Non-binary</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="looking-for">Looking for</Label>
                        <Select
                            disabled={isLoading}
                            value={lookingFor}
                            onValueChange={(value) => setLookingFor(value as LookingFor)}
                        >
                            <SelectTrigger className="w-full" id="looking-for">
                                <SelectValue placeholder="Select who you want to meet" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="man">Man</SelectItem>
                                <SelectItem value="couple">Couple</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date-of-birth">Date of birth</Label>
                        <Input
                            required
                            disabled={isLoading}
                            id="date-of-birth"
                            name="date-of-birth"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            required
                            autoComplete="address-level2"
                            disabled={isLoading}
                            id="city"
                            name="city"
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>

                    <Button className="w-full" disabled={isLoading} type="submit">
                        {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
                        Sign Up
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
            </div>
        </form>
    )
}

export default SignUpForm
