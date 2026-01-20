'use client'

import { type ChangeEvent, type ElementType, type ReactNode, useEffect, useMemo, useState } from 'react'

import { ArrowUpRight, Camera, CheckCircle, Heart, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { useGetUserProfileQuery, useUpdateProfileMutation } from '@/entities/user'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'

const initials = (value?: string) => (value ? value.slice(0, 2).toUpperCase() : '??')

const StatusDot = ({ status }: { status: 'online' | 'offline' }) => (
    <span
        className={cn(
            'flex h-2.5 w-2.5 items-center justify-center rounded-full',
            status === 'online' ? 'bg-emerald-500' : 'bg-muted-foreground/40'
        )}
    />
)

const InfoSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-24" />
    </div>
)

const PhotoGrid = ({ photos }: { photos: { urlSmall?: string; urlMedium?: string; urlLarge?: string }[] }) => {
    if (!photos.length) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-card/40 text-sm text-muted-foreground">
                <Camera className="mb-2 h-6 w-6" />
                <p>No photos yet. Add some to get more attention.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.slice(0, 6).map((photo, idx) => (
                <div
                    key={idx}
                    className="group relative overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm"
                >
                    <div
                        className="aspect-square bg-muted"
                        style={{
                            backgroundImage: photo.urlMedium ? `url(${photo.urlMedium})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                </div>
            ))}
        </div>
    )
}

const QuickAction = ({
    title,
    description,
    href,
    color,
    icon: Icon,
}: {
    title: string
    description: string
    href: string
    color: 'red' | 'purple' | 'blue' | 'gray'
    icon: ElementType
}) => {
    const colorClasses: Record<'red' | 'purple' | 'blue' | 'gray', string> = {
        red: 'bg-red-50 text-red-900 border-red-100',
        purple: 'bg-violet-50 text-violet-900 border-violet-100',
        blue: 'bg-sky-50 text-sky-900 border-sky-100',
        gray: 'bg-muted text-foreground border-border',
    }

    return (
        <Link
            href={href}
            className={cn(
                'flex flex-col gap-1 rounded-xl border p-4 transition hover:shadow-sm',
                colorClasses[color]
            )}
        >
            <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4" />
                {title}
            </div>
            <p className="text-xs opacity-80">{description}</p>
        </Link>
    )
}

type FormState = {
    fullName: string
    email: string
    height: string
    weight: string
    eyeColor: string
    hairColor: string
    situation: string
    silhouette: string
    personality: string
    schedule: string
    orientation: string
    children: string
    education: string
    profession: string
    description: string
}

const emptyForm: FormState = {
    fullName: '',
    email: '',
    height: '',
    weight: '',
    eyeColor: '0',
    hairColor: '0',
    situation: '0',
    silhouette: '0',
    personality: '0',
    schedule: '0',
    orientation: '1',
    children: '0',
    education: '0',
    profession: '0',
    description: '',
}

const FormField = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
    <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {children}
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
)

const parseNumber = (value: string): number | undefined => {
    if (!value.trim()) return undefined
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
}

const parseSelectNumber = (value: string, allowZero = false): number | undefined => {
    if (!value.trim()) return undefined
    if (!allowZero && value === '0') return undefined
    return parseNumber(value)
}

const toSelectValue = (value?: number, fallback = '0') =>
    typeof value === 'number' && Number.isFinite(value) ? String(value) : fallback

const EditProfileDialog = ({
    trigger,
    onUpdated,
    profile,
}: {
    trigger: React.ReactNode
    onUpdated?: () => void
    profile?: {
        fullName?: string
        username?: string
        email?: string
        description?: string
        height?: number
        weight?: number
        eyeColor?: number
        hairColor?: number
        situation?: number
        silhouette?: number
        personality?: number
        schedule?: number
        children?: number
        education?: number
        profession?: number
        orientation?: number
    }
}) => {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<FormState>(emptyForm)
    const [updateProfile, { isLoading, error }] = useUpdateProfileMutation()

    useEffect(() => {
        if (!profile || !open) return
        setForm((prev) => ({
            ...prev,
            fullName: profile.fullName ?? profile.username ?? '',
            email: profile.email ?? '',
            description: profile.description ?? '',
            height: profile.height ? String(profile.height) : '',
            weight: profile.weight ? String(profile.weight) : '',
            eyeColor: toSelectValue(profile.eyeColor),
            hairColor: toSelectValue(profile.hairColor),
            situation: toSelectValue(profile.situation),
            silhouette: toSelectValue(profile.silhouette),
            personality: toSelectValue(profile.personality),
            schedule: toSelectValue(profile.schedule),
            orientation: toSelectValue(profile.orientation, '1'),
            children: toSelectValue(profile.children),
            education: toSelectValue(profile.education),
            profession: toSelectValue(profile.profession),
        }))
    }, [profile, open])

    const errorMessage =
        (error as any)?.data?.message ?? (error as any)?.data?.error ?? (error as any)?.error ?? undefined

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!form.fullName.trim()) return

        await updateProfile({
            fullName: form.fullName.trim(),
            email: form.email.trim() || undefined,
            height: parseNumber(form.height),
            weight: parseNumber(form.weight),
            eyeColor: parseSelectNumber(form.eyeColor),
            hairColor: parseSelectNumber(form.hairColor),
            situation: parseSelectNumber(form.situation),
            silhouette: parseSelectNumber(form.silhouette),
            personality: parseSelectNumber(form.personality),
            schedule: parseSelectNumber(form.schedule),
            orientation: parseSelectNumber(form.orientation, true),
            children: parseSelectNumber(form.children, true),
            education: parseSelectNumber(form.education),
            profession: parseSelectNumber(form.profession),
            description: form.description.trim() || undefined,
        }).unwrap()

        setOpen(false)
        setForm(emptyForm)
        onUpdated?.()
    }

    const handleChange =
        (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [field]: event.target.value }))
        }

    const handleSelectChange = (field: keyof FormState) => (value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-5xl! w-full overflow-y-auto">
                <DialogHeader className="gap-1">
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Only fields supported by the API are shown. Select values match the site you referenced and
                        are sent as their numeric codes.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Full name *">
                            <Input
                                required
                                value={form.fullName}
                                onChange={handleChange('fullName')}
                                placeholder="Your name"
                            />
                        </FormField>
                        <FormField label="Email">
                            <Input
                                type="email"
                                value={form.email}
                                onChange={handleChange('email')}
                                placeholder="you@example.com"
                            />
                        </FormField>
                        <FormField label="Height (cm)">
                            <Input
                                inputMode="numeric"
                                value={form.height}
                                onChange={handleChange('height')}
                                placeholder="e.g. 180"
                            />
                        </FormField>
                        <FormField label="Weight (kg)">
                            <Input
                                inputMode="numeric"
                                value={form.weight}
                                onChange={handleChange('weight')}
                                placeholder="e.g. 75"
                            />
                        </FormField>
                        <FormField label="Eye color" hint="Values based on your provided selector list.">
                            <Select value={form.eyeColor} onValueChange={handleSelectChange('eyeColor')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select eye color" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select eye color</SelectItem>
                                    <SelectItem value="1">Brown</SelectItem>
                                    <SelectItem value="2">Blue</SelectItem>
                                    <SelectItem value="3">Green</SelectItem>
                                    <SelectItem value="4">Hazel</SelectItem>
                                    <SelectItem value="5">Gray</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Hair color" hint="Values based on your provided selector list.">
                            <Select value={form.hairColor} onValueChange={handleSelectChange('hairColor')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select hair color" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select hair color</SelectItem>
                                    <SelectItem value="1">Black</SelectItem>
                                    <SelectItem value="2">Brown</SelectItem>
                                    <SelectItem value="3">Blonde</SelectItem>
                                    <SelectItem value="4">Red</SelectItem>
                                    <SelectItem value="5">Gray</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Marital status" hint="Values based on your provided selector list.">
                            <Select value={form.situation} onValueChange={handleSelectChange('situation')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select status</SelectItem>
                                    <SelectItem value="1">Single</SelectItem>
                                    <SelectItem value="2">Divorced</SelectItem>
                                    <SelectItem value="3">Widowed</SelectItem>
                                    <SelectItem value="4">It's complicated</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Body type" hint="Values based on your provided selector list.">
                            <Select value={form.silhouette} onValueChange={handleSelectChange('silhouette')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select body type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select body type</SelectItem>
                                    <SelectItem value="1">Slim</SelectItem>
                                    <SelectItem value="2">Athletic</SelectItem>
                                    <SelectItem value="3">Average</SelectItem>
                                    <SelectItem value="4">Curvy</SelectItem>
                                    <SelectItem value="5">Full-figured</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Personality" hint="Values based on your provided selector list.">
                            <Select value={form.personality} onValueChange={handleSelectChange('personality')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select personality" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select personality</SelectItem>
                                    <SelectItem value="1">Outgoing</SelectItem>
                                    <SelectItem value="2">Shy</SelectItem>
                                    <SelectItem value="3">Funny</SelectItem>
                                    <SelectItem value="4">Serious</SelectItem>
                                    <SelectItem value="5">Adventurous</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField
                            label="Preferred online time"
                            hint="Values based on your provided selector list."
                        >
                            <Select value={form.schedule} onValueChange={handleSelectChange('schedule')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select time</SelectItem>
                                    <SelectItem value="1">Morning (6-12)</SelectItem>
                                    <SelectItem value="2">Afternoon (12-18)</SelectItem>
                                    <SelectItem value="3">Evening (18-24)</SelectItem>
                                    <SelectItem value="4">Night (0-6)</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Sexual orientation" hint="Values based on your provided selector list.">
                            <Select value={form.orientation} onValueChange={handleSelectChange('orientation')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select orientation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Heterosexual</SelectItem>
                                    <SelectItem value="2">Homosexual</SelectItem>
                                    <SelectItem value="3">Bisexual</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Number of children" hint="Values based on your provided selector list.">
                            <Select value={form.children} onValueChange={handleSelectChange('children')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="No children" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">No children</SelectItem>
                                    <SelectItem value="1">1 child</SelectItem>
                                    <SelectItem value="2">2 children</SelectItem>
                                    <SelectItem value="3">3 children</SelectItem>
                                    <SelectItem value="4">4+ children</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Education level" hint="Values based on your provided selector list.">
                            <Select value={form.education} onValueChange={handleSelectChange('education')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select education level</SelectItem>
                                    <SelectItem value="1">High School</SelectItem>
                                    <SelectItem value="2">Some College</SelectItem>
                                    <SelectItem value="3">Bachelor's Degree</SelectItem>
                                    <SelectItem value="4">Master's Degree</SelectItem>
                                    <SelectItem value="5">PhD/Doctorate</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Profession" hint="Values based on your provided selector list.">
                            <Select value={form.profession} onValueChange={handleSelectChange('profession')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select profession" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select profession</SelectItem>
                                    <SelectItem value="1">Technology</SelectItem>
                                    <SelectItem value="2">Healthcare</SelectItem>
                                    <SelectItem value="3">Education</SelectItem>
                                    <SelectItem value="4">Business</SelectItem>
                                    <SelectItem value="5">Creative Arts</SelectItem>
                                    <SelectItem value="6">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    <FormField label="Profile description">
                        <Textarea
                            rows={5}
                            maxLength={500}
                            value={form.description}
                            onChange={handleChange('description')}
                            placeholder="Tell others about yourself..."
                        />
                    </FormField>

                    {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

                    <DialogFooter className="gap-3">
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !form.fullName.trim()}>
                            {isLoading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export const ProfilePage = () => {
    const { data, isLoading, refetch } = useGetUserProfileQuery()
    const profile = data?.user

    const profileCompletion = useMemo(() => {
        if (!profile) return '--'
        const photoScore = Math.min((profile.photos?.length ?? 0) * 10, 40)
        const fieldsScore = 60 // placeholder until API exposes more completeness data
        return `${Math.min(photoScore + fieldsScore, 100)}%`
    }, [profile])

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <Card className="border-primary/10">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            {profile?.avatarUrl ? (
                                <AvatarImage alt={profile.username} src={profile.avatarUrl} />
                            ) : null}
                            <AvatarFallback className="text-lg font-semibold">
                                {initials(profile?.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            {isLoading ? (
                                <InfoSkeleton />
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold">{profile?.username ?? 'My Profile'}</h1>
                                        <Badge className="gap-1" variant="outline">
                                            <StatusDot status="online" /> Online now
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {profile?.age ? `${profile.age} yrs` : '-- years'} •{' '}
                                        {profile?.location ?? 'Location'}
                                    </p>
                                    {profile?.email ? (
                                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>
                    <EditProfileDialog
                        profile={profile}
                        onUpdated={refetch}
                        trigger={
                            <Button variant="outline">
                                Edit Profile
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        }
                    />
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <Card className="border-primary/10">
                    <CardHeader>
                        <CardTitle>Your Photos</CardTitle>
                        <CardDescription>Show your best shots to get more matches.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <Skeleton key={idx} className="aspect-square rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <PhotoGrid photos={profile?.photos ?? []} />
                        )}
                        <div className="flex items-center justify-between rounded-lg border border-dashed border-border/60 bg-card/40 px-4 py-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span>Profile completion</span>
                            </div>
                            <span className="font-semibold">{profileCompletion}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/10">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Jump into key flows.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <QuickAction
                            color="red"
                            description="Find new people nearby"
                            href="/matching"
                            icon={Sparkles}
                            title="Start Discovering"
                        />
                        <QuickAction
                            color="blue"
                            description="Check your conversations"
                            href="/chat"
                            icon={MessageCircle}
                            title="Check Messages"
                        />
                        <QuickAction
                            color="purple"
                            description="See who likes you"
                            href="/matches"
                            icon={Heart}
                            title="View Matches"
                        />
                        <QuickAction
                            color="gray"
                            description="Manage your account"
                            href="/dashboard"
                            icon={ArrowUpRight}
                            title="Settings"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
