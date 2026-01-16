'use client'

import React, { forwardRef, useRef } from 'react'

// eslint-disable-next-line boundaries/element-types
import Logo from '@/app/_layout/basic/logo'
import BlueskyIcon from '@/shared/icon/bluesky-icon'
import FacebookIcon from '@/shared/icon/facebook-icon'
import PinterestIcon from '@/shared/icon/pinterest-icon'
import ThreadsIcon from '@/shared/icon/threads-icon'
import YouTubeIcon from '@/shared/icon/youtube-icon'
import { cn } from '@/shared/lib/utils'
import { AnimatedBeam } from '@/shared/ui/animated-beam'

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
    ({ className, children }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 ',
                    className
                )}
            >
                {children}
            </div>
        )
    }
)

Circle.displayName = 'Circle'

export function AnimatedBeamMultipleOutputDemo({ className }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const div1Ref = useRef<HTMLDivElement>(null)
    const div2Ref = useRef<HTMLDivElement>(null)
    const div3Ref = useRef<HTMLDivElement>(null)
    // const div4Ref = useRef<HTMLDivElement>(null)
    const div5Ref = useRef<HTMLDivElement>(null)
    const div6Ref = useRef<HTMLDivElement>(null)
    const div7Ref = useRef<HTMLDivElement>(null)

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative flex h-[500px] w-full items-center justify-center overflow-hidden p-10',
                className
            )}
        >
            <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
                <div className="flex flex-col justify-center">
                    <Circle ref={div7Ref}>
                        <Icons.user />
                    </Circle>
                </div>
                <div className="flex flex-col justify-center">
                    <Circle ref={div6Ref} className="size-16">
                        <Icons.logo />
                    </Circle>
                </div>
                <div className="flex flex-col justify-center gap-2">
                    <Circle ref={div1Ref}>
                        <Icons.pinterest />
                    </Circle>
                    <Circle ref={div2Ref}>
                        <Icons.threads />
                    </Circle>
                    <Circle ref={div3Ref}>
                        <Icons.facebook />
                    </Circle>
                    {/* <Circle ref={div4Ref}>
                        <Icons.youtube />
                    </Circle> */}
                    <Circle ref={div5Ref}>
                        <Icons.bluesky />
                    </Circle>
                </div>
            </div>

            {/* AnimatedBeams */}
            <AnimatedBeam containerRef={containerRef} duration={3} fromRef={div1Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} duration={3} fromRef={div2Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} duration={3} fromRef={div3Ref} toRef={div6Ref} />
            {/* <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} duration={3} /> */}
            <AnimatedBeam containerRef={containerRef} duration={3} fromRef={div5Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} duration={3} fromRef={div6Ref} toRef={div7Ref} />
        </div>
    )
}

const Icons = {
    bluesky: () => <BlueskyIcon className="fill-[#0a7aff]" />,
    logo: () => <Logo />,
    pinterest: () => <PinterestIcon className="fill-[#E60023]" />,
    threads: () => <ThreadsIcon className="fill-black" />,
    facebook: () => <FacebookIcon className="fill-[#0866ff]" />,
    youtube: () => <YouTubeIcon className="fill-[#FF0000]" />,
    user: () => (
        <svg
            fill="none"
            height="24"
            stroke="#000000"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
}
