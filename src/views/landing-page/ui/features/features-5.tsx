import React from 'react'

import { HandHeart, Heart, HeartHandshake, Rainbow, Shield, ShieldCheck } from 'lucide-react'

import AnimatedContent from '@/shared/ui/AnimatedContent'
import { Badge } from '@/shared/ui/badge'
import CountUp from '@/shared/ui/count-up'

const values = [
    {
        title: 'Love Knows No Boundaries',
        description: 'We celebrate every story, every identity, and every path to connection.',
        icon: HeartHandshake,
    },
    {
        title: 'LGBTQ+ Friendly',
        description: 'Built with inclusive experiences and community-first policies.',
        icon: Rainbow,
    },
    {
        title: 'Safe Space',
        description: 'Reporting, verification, and moderation create a respectful environment.',
        icon: ShieldCheck,
    },
    {
        title: 'Equal Opportunities',
        description: 'Everyone gets seen, supported, and welcomed here.',
        icon: HandHeart,
    },
]

const stats = [
    { label: 'Inclusive', value: 100, suffix: '%' },
    { label: 'Customer support', value: 24, suffix: '/7' },
    { label: 'Tolerance for hate', value: 0, suffix: '' },
    { label: 'Successful couples', value: 100, prefix: '+' },
]

const Features5 = () => {
    return (
        <section className="py-12 md:py-16 max-w-6xl mx-auto">
            <div className="flex flex-col items-center gap-4 text-center">
                <Badge className="bg-transparent border border-primary text-primary p-2 text-md rounded-xl flex gap-2 items-center">
                    <span className="p-1 bg-primary/10 rounded-md">
                        <Shield />
                    </span>
                    <p className="">Is It Safe For Us?</p>
                </Badge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-pacifico tracking-wide text-primary">
                    Love that welcomes everyone
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    A community where everyone belongs, supported by safety-first tools and human care.
                </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="grid gap-4 sm:grid-cols-2">
                    {values.map((item) => (
                        <AnimatedContent
                            key={item.title}
                            className="relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm"
                        >
                            <Heart className="absolute -right-4 top-2 size-16 text-primary/30" />
                            <Heart className="absolute -bottom-4 -left-4 h-14 w-14 text-primary/25" />
                            <div className="relative flex flex-col gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/40 text-primary">
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        </AnimatedContent>
                    ))}
                </div>

                <AnimatedContent className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                                Community Impact
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold">Numbers that back our promise</h3>
                        </div>
                        <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Live
                        </span>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-border bg-muted/40 p-4 text-left"
                            >
                                <div className="text-3xl font-semibold text-foreground">
                                    {stat.prefix ?? ''}
                                    {/*@ts-ignore*/}
                                    <CountUp duration={1.6} to={stat.value} />
                                    {stat.suffix ?? ''}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        We monitor reports 24/7 and keep our community safe with transparent moderation guidelines.
                    </div>
                </AnimatedContent>
            </div>
        </section>
    )
}

export default Features5
