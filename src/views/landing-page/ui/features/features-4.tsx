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
                                Profile setup
                            </span>
                        </div>
                        <div className="mt-6 grid gap-4">
                            <div className="rounded-xl border border-border bg-muted/40 p-4">
                                <div className="h-32 w-full rounded-lg bg-muted" />
                                <div className="mt-4 space-y-2">
                                    <div className="h-3 w-2/3 rounded-full bg-muted-foreground/20" />
                                    <div className="h-3 w-1/2 rounded-full bg-muted-foreground/20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-border bg-muted/40 p-4">
                                    <div className="h-14 w-full rounded-lg bg-muted" />
                                    <div className="mt-3 h-3 w-2/3 rounded-full bg-muted-foreground/20" />
                                </div>
                                <div className="rounded-xl border border-border bg-muted/40 p-4">
                                    <div className="h-14 w-full rounded-lg bg-muted" />
                                    <div className="mt-3 h-3 w-2/3 rounded-full bg-muted-foreground/20" />
                                </div>
                            </div>
                        </div>
                    </AnimatedContent>
                </div>

                <div className="grid items-center gap-8 md:grid-cols-2">
                    <AnimatedContent className="order-2 rounded-2xl border border-border bg-background p-6 shadow-sm md:order-1">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Match feed
                            </span>
                            <div className="flex gap-2">
                                <span className="h-2 w-10 rounded-full bg-muted-foreground/20" />
                                <span className="h-2 w-6 rounded-full bg-muted-foreground/20" />
                            </div>
                        </div>
                        <div className="mt-6 space-y-4">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-4 rounded-xl border border-border p-4"
                                >
                                    <div className="h-12 w-12 rounded-full bg-muted" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-1/3 rounded-full bg-muted-foreground/20" />
                                        <div className="h-3 w-2/3 rounded-full bg-muted-foreground/20" />
                                    </div>
                                    <div className="h-8 w-16 rounded-full bg-muted" />
                                </div>
                            ))}
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
                    </AnimatedContent>
                </div>
            </div>
        </section>
    )
}

export default Features4
