import React from 'react'

import { CheckCircle2, ShieldQuestion } from 'lucide-react'

import AnimatedContent from '@/shared/ui/AnimatedContent'
import { Badge } from '@/shared/ui/badge'

const steps = [
    {
        title: 'Create Your Profile',
        description: 'Craft a standout profile with photos, prompts, and what you are looking for.',
    },
    {
        title: 'Discover Matches',
        description: 'Browse curated matches powered by compatibility signals and shared intent.',
    },
    {
        title: 'Start Chatting',
        description: 'Send an opener and move the conversation forward with confidence.',
    },
]

const giftPreviewItems = [
    { emoji: '🌹', label: 'Rose' },
    { emoji: '💌', label: 'Love note' },
    { emoji: '🍫', label: 'Choco' },
    { emoji: '🧸', label: 'Teddy' },
    { emoji: '✨', label: 'Sparkle' },
    { emoji: '🎁', label: 'Surprise' },
]

const Features4 = () => {
    return (
        <section className="py-12 md:py-16 max-w-6xl mx-auto">
            <div className="flex flex-col gap-4 text-center">
                <Badge className="bg-transparent border border-primary text-primary p-2 text-md rounded-xl flex gap-2 items-center mx-auto">
                    <span className="p-1 bg-primary/10 rounded-md">
                        <ShieldQuestion />
                    </span>
                    <p className="">How it Works?</p>
                </Badge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    <span className="tracking-wide font-pacifico text-primary">Three simple steps</span> to
                    meaningful dates
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    LoveConnect turns introductions into real conversations with a focused, guided flow.
                </p>
            </div>

            <div className="mt-12 flex flex-col gap-10">
                <div className="grid items-center gap-8 md:grid-cols-2">
                    <AnimatedContent className="flex flex-col gap-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            Your first impression
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-semibold leading-tight">
                            Get seen by the right people quickly
                        </h3>
                        <p className="text-muted-foreground">
                            Build a profile that highlights what matters. We make it easy to show your personality
                            and intent.
                        </p>
                        <div className="flex flex-col gap-4">
                            {steps.map((step) => (
                                <div key={step.title} className="flex gap-3">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-semibold">{step.title}</p>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AnimatedContent>

                    <AnimatedContent className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Match card
                            </span>
                        </div>
                        <div className="mt-6 grid gap-4">
                            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-pink-500/10 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                            New match
                                        </p>
                                        <h4 className="text-lg font-semibold">Arielle, 27</h4>
                                        <p className="text-sm text-muted-foreground">Lisbon, 3 km away</p>
                                    </div>
                                    <div className="flex -space-x-2">
                                        <div className="h-14 w-14 rounded-full border-2 border-background bg-muted" />
                                        <div className="h-14 w-14 rounded-full border-2 border-background bg-muted/80" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Compatibility</span>
                                        <span className="font-semibold text-foreground">92%</span>
                                    </div>
                                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                                        <div className="h-2 w-[92%] rounded-full bg-primary" />
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {['Art lover', 'Coffee dates', 'Travel'].map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-full bg-primary/10 px-4 py-2 text-center text-xs font-semibold text-primary">
                                        Super Like
                                    </div>
                                    <div className="rounded-full bg-foreground px-4 py-2 text-center text-xs font-semibold text-background">
                                        Start chat
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-border bg-muted/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                        Icebreaker
                                    </p>
                                    <div className="mt-3 h-3 w-3/4 rounded-full bg-muted-foreground/20" />
                                    <div className="mt-2 h-3 w-1/2 rounded-full bg-muted-foreground/20" />
                                </div>
                                <div className="rounded-xl border border-border bg-muted/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                        Mutuals
                                    </p>
                                    <div className="mt-3 flex -space-x-2">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="h-7 w-7 rounded-full bg-muted" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedContent>
                </div>

                <div className="grid items-center gap-8 md:grid-cols-2">
                    <AnimatedContent className="order-2 rounded-2xl border border-border bg-background p-6 shadow-sm md:order-1">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Chat + gifts
                            </span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                Online now
                            </div>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="rounded-2xl border border-border bg-muted/30 p-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Chat with Mia</span>
                                    <span>Just now</span>
                                </div>
                                <div className="mt-4 space-y-3">
                                    <div className="w-3/4 rounded-2xl bg-background px-4 py-3 text-sm shadow-sm">
                                        That playlist you shared is perfect for a rainy day.
                                    </div>
                                    <div className="ml-auto w-3/4 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">
                                        Want to continue this over coffee on Saturday?
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="h-2 w-10 rounded-full bg-muted-foreground/20" />
                                    <div className="h-2 w-6 rounded-full bg-muted-foreground/20" />
                                </div>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                            Send a gift
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            0.10 = <span className="font-semibold text-foreground">5 credits</span>
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        Gift tray
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    {giftPreviewItems.map((gift) => (
                                        <div
                                            key={gift.label}
                                            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted/40 px-2 py-3 text-center"
                                        >
                                            <span className="text-lg">{gift.emoji}</span>
                                            <span className="text-[11px] text-muted-foreground">{gift.label}</span>
                                            <span className="text-[11px] font-semibold text-foreground">5 cr</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </AnimatedContent>

                    <AnimatedContent className="order-1 flex flex-col gap-6 md:order-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            Keep momentum
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-semibold leading-tight">
                            Discover matches and start chatting fast
                        </h3>
                        <p className="text-muted-foreground">
                            Your feed updates in real time and messaging is built for quick, meaningful
                            conversations.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {steps.slice(1).map((step) => (
                                <div key={step.title} className="rounded-xl border border-border bg-muted/40 p-4">
                                    <p className="font-semibold">{step.title}</p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { title: 'Send a Gift', value: '5 credits', note: 'Make it memorable' },
                                { title: 'Quick Reply', value: '2 taps', note: 'Keep the vibe' },
                                { title: 'Date Invite', value: '1 click', note: 'Plan a meetup' },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-xl border border-border bg-background p-4"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                        {item.title}
                                    </p>
                                    <p className="mt-2 text-lg font-semibold">{item.value}</p>
                                    <p className="text-sm text-muted-foreground">{item.note}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-muted/40 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    Momentum Score
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-3xl font-semibold text-foreground">92</p>
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        +12%
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Stay active and keep conversations moving forward.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    Smart Reminders
                                </p>
                                <div className="mt-3 space-y-2">
                                    {['Follow up in 2 hours', 'Suggest a venue', 'Send a voice note'].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
                                            >
                                                <span>{item}</span>
                                                <span className="h-2 w-2 rounded-full bg-primary" />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </AnimatedContent>
                </div>
            </div>
        </section>
    )
}

export default Features4
