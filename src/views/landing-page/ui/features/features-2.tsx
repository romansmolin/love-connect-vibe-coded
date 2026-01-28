import React from 'react'

import { BellRing, Gift, HeartHandshake, MapPin, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'

import AnimatedContent from '@/shared/ui/AnimatedContent'
import { Badge } from '@/shared/ui/badge'

const featureCards = [
    {
        title: 'Smart Matching',
        description: 'Compatibility signals, shared values, and intent-first profiles surface the best matches.',
        icon: Sparkles,
        className: 'md:col-span-7 border border-primary',
    },
    {
        title: '100% Safe & Secure',
        description:
            'Profile verification, reporting tools, and private controls keep every connection protected.',
        icon: ShieldCheck,
        className: 'md:col-span-5 border border-primary',
    },
    {
        title: 'Instant Messaging',
        description: 'Start conversations in seconds with a fast, modern chat experience.',
        icon: MessageCircle,
        className: 'md:col-span-4 border border-primary',
    },
    {
        title: 'Location-Based',
        description: 'Meet people nearby with precise distance filters and privacy-first location sharing.',
        icon: MapPin,
        className: 'md:col-span-4 border border-primary',
    },
    {
        title: 'Virtual Gifts',
        description: 'Send playful moments that break the ice and spark real conversations.',
        icon: Gift,
        className: 'md:col-span-4 border border-primary ',
    },
    {
        title: 'Real-Time Notifications',
        description: 'Never miss a match, message, or profile like with instant updates.',
        icon: BellRing,
        className: 'md:col-span-12 border border-primary ',
    },
]

const Features2 = () => {
    return (
        <section className="py-12 md:py-16">
            <div className="flex flex-col items-center gap-5 text-center">
                <Badge className="bg-transparent border border-primary text-primary p-2 text-md rounded-xl flex gap-2 items-center">
                    <span className="p-1 bg-primary/10 rounded-md">
                        <HeartHandshake />
                    </span>
                    <p className=""> Why Choose LoveBond?</p>
                </Badge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    Made for{' '}
                    <span className="relative inline-block font-pacifico text-primary tracking-wide">
                        Meaningful Dates
                        <svg
                            className="absolute left-0 -bottom-2 w-full translate-y-1/2 text-primary max-sm:hidden"
                            fill="none"
                            height="12"
                            preserveAspectRatio="none"
                            viewBox="0 0 423 12"
                            width="423"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0 9C38 4.5 76 2.5 114 2.2C152 1.9 190 1.5 228 3.2C266 5 304 7 342 6.2C380 5.5 402 4.5 423 4"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="2"
                            />
                        </svg>
                    </span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Experience dating like never before with our advanced matching system
                </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-12 max-w-screen-lg mx-auto">
                {featureCards.map((feature) => (
                    <AnimatedContent
                        key={feature.title}
                        className={`group relative overflow-hidden rounded-2xl bg-primary/5 border border-border/60 p-6 shadow-sm ${feature.className}`}
                    >
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_70%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_70%)]" />
                        </div>
                        <div className="relative flex h-full flex-col gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background/70 text-primary ring-1 ring-inset ring-primary/15">
                                <feature.icon className="h-5 w-5" />
                            </span>
                            <h3 className="text-2xl font-semibold text-primary">{feature.title}</h3>
                            <p className="text-sm text-foreground/70">{feature.description}</p>
                        </div>
                    </AnimatedContent>
                ))}
            </div>
        </section>
    )
}

export default Features2
