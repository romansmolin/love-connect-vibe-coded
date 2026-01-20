'use client'

import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { RetroGrid } from '@/shared/ui/retro-grid'
import { WordRotate } from '@/shared/ui/word-rotate'

export const HeroSection04 = () => {
    const avatars = [
        {
            src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/avatar1.png',
            alt: 'Avatar 1',
        },
        {
            src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/avatar2.png',
            alt: 'Avatar 2',
        },
        {
            src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/avatar3.png',
            alt: 'Avatar 3',
        },
        {
            src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/avatar4.png',
            alt: 'Avatar 4',
        },
        {
            src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/avatar5.png',
            alt: 'Avatar 5',
        },
    ]

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
                                className="bg-gradient-to-r w-fit text-primary font-pacifico mx-auto lg:mx-0 m-0"
                                duration={2500}
                                containerClassName={'flex justify-center sm:block'}
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
                            {avatars.map((avatar) => (
                                <Image
                                    key={avatar.src}
                                    alt={avatar.alt}
                                    className="h-10 w-10 rounded-full border-2 border-background object-cover"
                                    height={40}
                                    src={avatar.src}
                                    width={40}
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
                    <Image
                        alt="Happy couple holding hearts"
                        className="h-auto w-full max-w-xl object-contain drop-shadow-2xl"
                        height={900}
                        priority
                        src="/assets/hero.png"
                        width={900}
                    />
                </div>
            </div>
        </section>
    )
}
