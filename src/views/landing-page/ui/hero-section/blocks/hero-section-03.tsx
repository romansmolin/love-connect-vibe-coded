'use client'

import Link from 'next/link'

import { AuroraText } from '@/shared/ui/aurora-text'
import { Particles } from '@/shared/ui/particles'
import { ShimmerButton } from '@/shared/ui/shimmer-button'
import { TextAnimate } from '@/shared/ui/text-animate'

export const HeroSection03 = () => {
    return (
        <section className="relative flex min-h-[calc(100dvh-4rem)] flex-1 flex-col items-center justify-center overflow-hidden px-4 pt-20 sm:px-6 lg:px-8">
            {/* Particles Background */}
            <Particles
                className="absolute inset-0 -z-10"
                color="#7c3aed"
                ease={50}
                quantity={120}
                size={0.5}
                staticity={30}
            />

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/0 via-background/50 to-background" />

            <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
                {/* Animated Badge */}
                <div className="animate-fade-in rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm backdrop-blur-sm">
                    <span className="text-muted-foreground">✨ AI-Powered Matching</span>
                </div>

                {/* Main Heading with Aurora Effect */}
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    <TextAnimate animation="blurInUp" as="span" by="word" className="block">
                        Find Your Perfect Match
                    </TextAnimate>
                    <span className="mt-2 block">
                        with{' '}
                        <AuroraText
                            className="font-extrabold"
                            colors={['#7c3aed', '#ec4899', '#06b6d4', '#10b981']}
                            speed={1.5}
                        >
                            LoveConnect
                        </AuroraText>
                    </span>
                </h1>

                {/* Description */}
                <TextAnimate
                    animation="fadeIn"
                    as="p"
                    by="word"
                    className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
                    delay={0.3}
                >
                    Connect with compatible singles in your area. Our smart algorithm finds people who share your
                    interests and values, making meaningful connections effortless.
                </TextAnimate>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href="#pricing">
                        <ShimmerButton
                            background="linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)"
                            className="h-12 min-w-[200px] text-base font-semibold"
                            shimmerColor="#a855f7"
                            shimmerDuration="2.5s"
                            shimmerSize="0.1em"
                        >
                            Start Free Trial
                        </ShimmerButton>
                    </Link>
                    <Link
                        className="inline-flex h-12 items-center justify-center rounded-full border border-primary/30 bg-background/50 px-8 text-base font-medium backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/5"
                        href="#features"
                    >
                        See How It Works
                    </Link>
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-3 gap-8 border-t border-border/40 pt-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground sm:text-3xl">50K+</div>
                        <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground sm:text-3xl">1M+</div>
                        <div className="text-sm text-muted-foreground">Matches Made</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground sm:text-3xl">99.9%</div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
