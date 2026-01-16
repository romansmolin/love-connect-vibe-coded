'use client'

import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { RetroGrid } from '@/shared/ui/retro-grid'
import { WordRotate } from '@/shared/ui/word-rotate'

export const HeroSection04 = () => {
    return (
        <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden">
            <RetroGrid
                angle={65}
                cellSize={70}
                className="opacity-40"
                darkLineColor="hsl(var(--primary) / 0.2)"
                lightLineColor="hsl(var(--primary) / 0.3)"
            />

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-12 px-4 pt-32 pb-20 sm:px-6 lg:flex-row lg:gap-16 lg:px-8 lg:pt-40">
                <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
                    <Badge
                        className="gap-2 border-primary/30 bg-primary/5 px-4 py-2 text-sm backdrop-blur-sm"
                        variant="outline"
                    >
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>New: AI Compatibility Matching</span>
                    </Badge>

                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-8xl w-full">
                        <span className="block text-foreground">Find Love</span>
                        <span className="block">
                            <WordRotate
                                className="bg-gradient-to-r w-fit text-primary font-pacifico"
                                duration={2500}
                                words={['Smarter', 'Faster', 'Better', 'Easier']}
                            />
                            <span className="text-foreground">Than Ever</span>
                        </span>
                    </h1>

                    <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
                        Discover meaningful connections with intelligent matching.
                        <span className="font-medium text-foreground"> LoveConnect </span>
                        analyzes compatibility to help you find your perfect match.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            asChild
                            className="group h-14 gap-2 rounded-xl bg-gradient-to-r from-primary to-pink-500 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                            size="lg"
                        >
                            <Link href="#pricing">
                                <Zap className="h-5 w-5" />
                                Get Started Free
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="h-14 rounded-xl border-2 px-8 text-base font-semibold"
                            size="lg"
                            variant="outline"
                        >
                            <Link href="#demo">Watch Demo</Link>
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-pink-500/20"
                                />
                            ))}
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold text-foreground">50,000+</span>
                            <span className="text-muted-foreground"> happy couples</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center size-full">
                    <svg
                        className="fill-primary h-[500px]"
                        viewBox="0 0 200 200"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M56,-63.9C69.6,-55.4,75.4,-34.9,76.8,-15.3C78.2,4.3,75.1,22.9,67.2,40.8C59.2,58.7,46.5,75.8,29.5,82.8C12.4,89.8,-9,86.6,-26.5,78C-44.1,69.4,-57.9,55.4,-66.9,39C-76,22.6,-80.3,3.8,-76,-12.2C-71.7,-28.2,-58.8,-41.4,-44.7,-49.8C-30.5,-58.3,-15.3,-62,3,-65.5C21.2,-69.1,42.4,-72.5,56,-63.9Z"
                            transform="translate(100 100)"
                        />
                    </svg>
                </div>
            </div>
        </section>
    )
}
