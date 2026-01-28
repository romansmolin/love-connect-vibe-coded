'use client'

import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import AnimatedContent from '@/shared/ui/AnimatedContent'
import { ShineBorder } from '@/shared/ui/shine-border'

const beforeConfig = {
    title: 'Traditional Dating Apps Are Frustrating',
    items: [
        'Endless swiping with no meaningful connections.',
        'Fake profiles and catfishing waste your time.',
        'No way to know if someone is truly compatible.',
        "Limited matches that don't align with your values.",
    ],
}

const afterConfig = {
    title: 'LoveBond Makes Dating Effortless',
    items: [
        'AI-powered matching finds truly compatible partners.',
        'Verified profiles ensure authentic connections.',
        'Smart algorithm learns your preferences over time.',
        'Meaningful conversations lead to real relationships.',
    ],
}

export const BeforeAfter02 = () => {
    const renderList = (items: string[], isAfter: boolean) => (
        <ul className="space-y-3 text-base sm:text-lg">
            {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                    <div className={cn('shrink-0 py-1.5 text-primary', isAfter && 'text-white')}>
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span
                        className={cn(
                            'text-slate-700 dark:text-slate-300 leading-relaxed',
                            isAfter && 'text-white'
                        )}
                    >
                        {item}
                    </span>
                </li>
            ))}
        </ul>
    )

    return (
        <section className="relative flex flex-col gap-12 overflow-hidden bg-primary/40 py-8 md:py-14">
            <h2 className="text-center text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Find Your Perfect Match with <span className="font-pacifico text-primary">LoveBond</span>
            </h2>
            <div className="mx-auto max-w-6xl px-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Before Card with Shine Border */}
                    <AnimatedContent reverse direction="horizontal" duration={0.45}>
                        <div className="relative rounded-3xl overflow-hidden h-full">
                            <ShineBorder
                                borderWidth={2}
                                duration={10}
                                shineColor={['#ff00c8', '#ec4899', '#7c3aed']}
                            />
                            <div className="relative rounded-3xl bg-white h-full dark:bg-slate-900 p-8 sm:p-12 flex flex-col">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <XCircle className="h-6 w-6 text-primary" />
                                    <p className="text-base font-semibold text-primary">Before</p>
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl leading-tight">
                                    {beforeConfig.title}
                                </h3>
                                <div className="mt-6 flex-1">{renderList(beforeConfig.items, false)}</div>
                            </div>
                        </div>
                    </AnimatedContent>

                    {/* After Card with Neon Gradient */}
                    <AnimatedContent direction="horizontal" duration={0.45}>
                        <div className="relative rounded-3xl overflow-hidden h-full">
                            <div className="p-8 sm:p-12 flex flex-col h-full bg-primary text-white">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <ArrowRight className="h-6 w-6" />
                                    <p className="text-base font-semibold">After</p>
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl leading-tight">
                                    {afterConfig.title}
                                </h3>
                                <div className="mt-6 flex-1 text-white">{renderList(afterConfig.items, true)}</div>
                            </div>
                        </div>
                    </AnimatedContent>
                </div>
            </div>
        </section>
    )
}
