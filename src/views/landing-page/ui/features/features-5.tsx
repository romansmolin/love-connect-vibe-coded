import React from 'react'

import { HandHeart, Heart, HeartHandshake, Rainbow, Shield, ShieldCheck } from 'lucide-react'

import AnimatedContent from '@/shared/ui/AnimatedContent'
import { Badge } from '@/shared/ui/badge'

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
                                Safety tools
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold">
                                Tools that support better conversations
                            </h3>
                        </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        Use reporting and moderation tools whenever a conversation or profile does not feel right.
                    </div>
                </AnimatedContent>
            </div>
        </section>
    )
}

export default Features5
