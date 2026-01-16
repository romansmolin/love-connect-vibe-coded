import React from 'react'

import { Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'

const HeroSections02 = () => {
    return (
        <section className="px-4 pt-40 lg:pt-48 flex flex-col sm:flex-row gap-10 md:gap-12 lg:max-w-screen-lg md:mx-auto md:items-center">
            {/* Left Side */}
            <div className="flex flex-col items-center gap-10 lg:w-[55%] lg:items-start">
                <div className="flex flex-col gap-5">
                    <h1
                        className="text-center leading-14 text-5xl sm:leading-16 md:text-7xl font-bold md:leading-20 lg:text-start lg:text-7xl lg:leading-18"
                        style={{
                            fontFamily:
                                '"Be Vietnam Pro", "Be Vietnam Pro Fallback", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                            fontWeight: 700,
                            // fontSize: '3rem',
                            lineHeight: 1.2,
                            // textAlign: 'center',
                            color: 'var(--foreground, #0f172a)',
                        }}
                    >
                        Find Your Perfect Match Today
                    </h1>

                    <div className="text-primary w-[80%] sm:w-[90%] lg:w-full m-auto">
                        <svg
                            className="w-full h-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 487 34"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M 4 30 C 73.631 10.38 266.914 -17.088 483 30"
                                fill="transparent"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="8"
                            />
                        </svg>
                    </div>
                </div>

                <p
                    className="text-center leading-relaxed md:max-w-md md:text-xl lg:text-start"
                    style={{
                        fontFamily:
                            '"Be Vietnam Pro", "Be Vietnam Pro Fallback", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        fontSize: '1.125rem',
                        lineHeight: 1.6,
                        color: 'var(--foreground, #1f2937)',
                    }}
                >
                    With <span className="italic font-bold text-primary">LoveConnect</span>, discover meaningful
                    connections, chat with compatible matches, and find the relationship you've been looking for.{' '}
                </p>

                <div className="flex gap-5 w-full">
                    <Button asChild className="h-12 text-md w-full" size="lg">
                        <Link href="#pricing">
                            <Heart />
                            Try For Free
                        </Link>
                    </Button>
                    {/* <Button className="h-12 text-md" size="lg" variant="outline">
                        <Video /> Watch Demo
                    </Button> */}
                </div>
            </div>

            {/* Right Side */}
            <div className="flex justify-center lg:w-[45%] relative pt-15">
                <div className="flex justify-center">
                    <Image
                        priority
                        alt="Hero Section Image For Medium Screens"
                        className="h-auto size-65 sm:size-75 md:size-auto object-contain"
                        height={700}
                        src="/assets/hero-xxl.png"
                        width={800}
                    />
                </div>
            </div>
        </section>
    )
}

export default HeroSections02
