'use client'

import { ArrowRight } from 'lucide-react'

import AnimatedContent from '@/shared/ui/AnimatedContent'
import { MagicCard } from '@/shared/ui/magic-card'

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

export const BeforeAfter01 = () => {
    const renderList = (items: string[]) => (
        <ul className="space-y-3 text-base sm:text-lg">
            {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                    <div className="shrink-0 py-1.5 text-primary">
                        <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z" />
                        </svg>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                </li>
            ))}
        </ul>
    )

    return (
        <section className="relative flex flex-col gap-12 overflow-hidden bg-primary py-8 md:py-14">
            <h2 className="text-center text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Find Your Perfect Match with <span className="italic font-[var(--pacifico)]">LoveBond</span>
            </h2>
            <div className="mx-auto max-w-5xl px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Before Card */}
                    <AnimatedContent reverse direction="horizontal" duration={0.45}>
                        <div className="relative rounded-2xl bg-white dark:bg-slate-900 flex-1 h-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                            <div className="relative p-8 sm:p-12 h-full flex flex-col">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <svg
                                        aria-hidden="true"
                                        className="h-6 w-6 text-primary"
                                        fill="currentColor"
                                        viewBox="0 0 256 256"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M232,184a8,8,0,0,1-16,0A88,88,0,0,0,67.47,120.16l26.19,26.18A8,8,0,0,1,88,160H24a8,8,0,0,1-8-8V88a8,8,0,0,1,13.66-5.66l26.48,26.48A104,104,0,0,1,232,184Z"></path>
                                    </svg>
                                    <p className="text-base font-semibold text-primary">Before</p>
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl leading-tight">
                                    {beforeConfig.title}
                                </h3>
                                <div className="mt-6 flex-1">{renderList(beforeConfig.items)}</div>
                            </div>
                        </div>
                    </AnimatedContent>

                    {/* After Card with Magic UI */}
                    <AnimatedContent direction="horizontal" duration={0.45}>
                        <MagicCard
                            className="relative rounded-2xl flex-1 h-full overflow-hidden"
                            gradientFrom="#7c3aed"
                            gradientSize={250}
                            gradientTo="#ec4899"
                        >
                            <div className="relative p-8 sm:p-12 h-full flex flex-col">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <ArrowRight className="h-6 w-6 text-primary" />
                                    <p className="text-base font-semibold text-primary">After</p>
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl leading-tight">
                                    {afterConfig.title}
                                </h3>
                                <div className="mt-6 flex-1">{renderList(afterConfig.items)}</div>
                            </div>
                        </MagicCard>
                    </AnimatedContent>
                </div>
            </div>
        </section>
    )
}
