import React from 'react'

import { Blocks, Bot, BrickWallIcon, CircleArrowOutUpRightIcon, CircleDollarSign, Target } from 'lucide-react'

import AnimatedContent from '@/shared/ui/AnimatedContent'

const features = [
    {
        icon: CircleDollarSign,
        title: 'Fair Pricing',
        description: 'Affordable plans for everyone. Find love without breaking the bank.',
    },
    {
        icon: Blocks,
        title: 'Simple & Intuitive',
        description: 'No complicated setups or confusing interfaces. LoveBond is easy to use and navigate.',
    },
    {
        icon: Target,
        title: 'Smart Matching',
        description: 'Our algorithm finds compatible matches based on your interests, values, and preferences.',
    },
    {
        icon: Bot,
        title: 'AI-Powered Compatibility',
        description: 'Advanced AI analyzes profiles to suggest the most compatible matches for you.',
    },
    // {
    //     icon: ChartPie,
    //     title: 'Advanced Analytics',
    //     description: 'Track engagement, clicks, and user activity with intuitive charts and reports.',
    // },
    {
        icon: BrickWallIcon,
        title: 'Safe & Secure',
        description: 'Your privacy and safety are our top priorities. Verified profiles and secure messaging.',
    },
    {
        icon: CircleArrowOutUpRightIcon,
        title: 'Real Connections',
        description: 'Meet genuine people looking for meaningful relationships, not just casual encounters.',
    },
]

const Features1 = () => {
    return (
        <div className="flex items-center justify-center py-10 md:py-14">
            <div className="flex flex-col gap-12">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center">
                    Why <span className="text-primary">LoveBond</span> is Different
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-lg mx-auto px-6">
                    {features.map((feature) => (
                        <AnimatedContent key={feature.title}>
                            <div className="flex flex-col border rounded-xl py-6 px-5 ring-1 ring-inset ring-primary">
                                <div className="mb-3 h-10 w-10 flex items-center justify-center bg-primary/10 rounded-full">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-lg font-semibold text-primary">{feature.title}</span>
                                <p className="mt-1 text-foreground/80 text-[15px]">{feature.description}</p>
                            </div>
                        </AnimatedContent>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Features1
