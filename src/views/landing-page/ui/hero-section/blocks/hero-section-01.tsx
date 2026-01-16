import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

export const HeroSection01 = () => {
    return (
        <section className="flex pt-40 lg:pt-50 min-h-[calc(100dvh-4rem)] flex-1 flex-col justify-between gap-12 overflow-x-hidden sm:gap-16 sm:pt-16 lg:gap-24">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8">
                <div className="bg-muted flex items-center gap-2.5 rounded-full border px-3 py-2">
                    <Badge>AI-Powered</Badge>
                    <span className="text-muted-foreground">Find your perfect match today</span>
                </div>

                <h1 className="text-4xl leading-[1.29167] font-bold text-balance sm:text-4xl lg:text-5xl">
                    Connect with someone special
                    <br />
                    <span className="relative">
                        Effortless
                        <svg
                            className="absolute inset-x-0 bottom-0 w-full translate-y-1/2 max-sm:hidden"
                            fill="none"
                            height="12"
                            viewBox="0 0 223 12"
                            width="223"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M1.11716 10.428C39.7835 4.97282 75.9074 2.70494 114.894 1.98894C143.706 1.45983 175.684 0.313587 204.212 3.31596C209.925 3.60546 215.144 4.59884 221.535 5.74551"
                                stroke="url(#paint0_linear_10365_68643)"
                                strokeLinecap="round"
                                strokeWidth="2"
                            />
                            <defs>
                                <linearGradient
                                    gradientUnits="userSpaceOnUse"
                                    id="paint0_linear_10365_68643"
                                    x1="18.8541"
                                    x2="42.6487"
                                    y1="3.72033"
                                    y2="66.6308"
                                >
                                    <stop stopColor="var(--primary)" />
                                    <stop offset="1" stopColor="var(--primary-foreground)" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </span>{' '}
                    dating with LoveConnect
                </h1>

                <p className="text-muted-foreground max-w-3xl">
                    Discover meaningful connections with our smart matching algorithm. Chat, meet, and build
                    relationships that matter—all in one place.
                </p>

                <Button asChild size="lg">
                    <Link href="#pricing">Get started</Link>
                </Button>
            </div>

            {/* Image */}
            <Image
                alt="Dishes"
                className="min-h-67 w-full object-cover"
                height={200}
                src="/assets/hero-section.png"
                width={1000}
            />
        </section>
    )
}
