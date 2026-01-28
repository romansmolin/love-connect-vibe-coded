import { BadgeCheck, Clock4, Layers, LayoutDashboard } from 'lucide-react'

import AnimatedContent from '@/shared/ui/AnimatedContent'
import { Globe } from '@/shared/ui/globe'

import { AnimatedBeamMultipleOutputDemo } from '../animated-beam-multiple-output'

const Features3 = () => {
    return (
        <div className="flex flex-col gap-10 py-10 md:gap-14 md:py-16">
            <div className="flex flex-col gap-3 text-center">
                <p className="text-primary text-sm font-semibold uppercase tracking-[0.14em]">Feature stack</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    What <span className="text-primary">LoveBond</span> Makes Effortless
                </h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                    Everything you need to find meaningful connections: smart matching, secure messaging, and
                    verified profiles.
                </p>
            </div>

            <section
                className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4"
                id="features"
            >
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-12">
                    <AnimatedContent className="relative min-h-[300px] overflow-hidden rounded-2xl bg-muted md:col-span-7 md:row-span-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
                        <div className="relative flex h-full flex-col justify-between p-8">
                            <div className="space-y-3 max-w-lg">
                                <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                                    Connect
                                </p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                    Find meaningful relationships that last.
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Our smart algorithm connects you with compatible singles who share your values
                                    and interests.
                                </p>
                            </div>
                            <Globe className="top-36" />
                        </div>
                    </AnimatedContent>

                    <AnimatedContent className="relative min-h-[300px] overflow-hidden rounded-2xl bg-muted md:col-span-5 md:row-span-2">
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                        <div className="relative flex h-full flex-col justify-between p-8">
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                                    AI Matching
                                </p>
                                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white leading-tight">
                                    Smart compatibility analysis.
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Advanced AI analyzes profiles to suggest highly compatible matches based on
                                    your preferences.
                                </p>
                            </div>
                            <AnimatedBeamMultipleOutputDemo className="mx-auto h-[240px] w-[90%] p-0" />
                        </div>
                    </AnimatedContent>

                    <AnimatedContent className="rounded-2xl bg-muted p-6 flex flex-col gap-3 md:col-span-4">
                        <span className="rounded-full bg-primary/10 w-fit p-2 text-primary">
                            <LayoutDashboard />
                        </span>
                        <h4 className="text-xl font-semibold">Secure Messaging</h4>
                        <p className="text-slate-600 dark:text-slate-300">
                            Chat safely with matches in our secure messaging system. Your privacy is protected.
                        </p>
                    </AnimatedContent>

                    <AnimatedContent className="rounded-2xl bg-muted p-6 flex flex-col gap-3 md:col-span-4">
                        <span className="rounded-full bg-primary/10 w-fit p-2 text-primary">
                            <BadgeCheck />
                        </span>
                        <h4 className="text-xl font-semibold">Verified Profiles</h4>
                        <p className="text-slate-600 dark:text-slate-300">
                            All profiles are verified to ensure authenticity and create a safe dating environment.
                        </p>
                    </AnimatedContent>

                    <AnimatedContent className="rounded-2xl bg-muted p-6 flex flex-col gap-3 md:col-span-4">
                        <span className="rounded-full bg-primary/10 w-fit p-2 text-primary">
                            <Clock4 />
                        </span>
                        <h4 className="text-xl font-semibold">Real-time Matching</h4>
                        <p className="text-slate-600 dark:text-slate-300">
                            Get instant notifications when you have new matches. Never miss a connection
                            opportunity.
                        </p>
                    </AnimatedContent>

                    <AnimatedContent className="rounded-2xl bg-muted p-6 flex flex-col gap-3 md:col-span-6">
                        <span className="rounded-full bg-primary/10 w-fit p-2 text-primary">
                            <Layers />
                        </span>
                        <h4 className="text-xl font-semibold">Detailed Profiles</h4>
                        <p className="text-slate-600 dark:text-slate-300">
                            Share your interests, values, and what you're looking for. Find people who truly match.
                        </p>
                    </AnimatedContent>

                    <AnimatedContent className="rounded-2xl bg-muted p-6 flex flex-col gap-3 md:col-span-6">
                        <span className="rounded-full bg-primary/10 w-fit p-2 text-primary">
                            <Layers />
                        </span>
                        <h4 className="text-xl font-semibold">Privacy Controls</h4>
                        <p className="text-slate-600 dark:text-slate-300">
                            Control who sees your profile and when. Your data is protected and never shared.
                        </p>
                    </AnimatedContent>
                </div>
            </section>
        </div>
    )
}

export default Features3
