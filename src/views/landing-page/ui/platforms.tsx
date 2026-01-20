'use client'

import React from 'react'

import Image from 'next/image'

import { Marquee } from '@/shared/ui/marquee'

const peopleImages = [
    { src: '/assets/girl1.png', alt: 'Happy user 1' },
    { src: '/assets/girl2.png', alt: 'Happy user 2' },
    { src: '/assets/girl3.png', alt: 'Happy user 3' },
    { src: '/assets/person1.png', alt: 'Happy user 4' },
    { src: '/assets/person2.png', alt: 'Happy user 5' },
]

export const People = () => {
    return (
        <section className="w-full mx-auto flex flex-col gap-10 py-10 md:py-14" id="how-it-works">
            <div className="flex flex-col mx-auto gap-3 md:flex-row md:items-end md:justify-between max-w-screen-xl">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                        How LoveConnect Works
                    </p>
                    <h2 className="text-3xl leading-10 sm:text-4xl md:text-[40px] md:leading-[3.25rem] font-bold tracking-tight">
                        Find your perfect match in three simple steps
                    </h2>
                </div>
                <p className="max-w-xl text-base text-slate-600 dark:text-slate-300">
                    Our smart matching algorithm connects you with compatible singles based on your interests,
                    values, and preferences.
                </p>
            </div>

            {/* Gallery Section */}
            <div className="relative mt-8">
                <Marquee pauseOnHover className="[--duration:40s]">
                    {peopleImages.map((image, index) => (
                        <div key={index} className="relative mx-2 h-64 w-48 shrink-0 overflow-hidden rounded-2xl">
                            <div className="relative h-full w-full">
                                <Image
                                    fill
                                    alt={image.alt}
                                    className="object-cover"
                                    sizes="(max-width: 768px) 192px, 192px"
                                    src={image.src}
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>
                <Marquee pauseOnHover reverse className="[--duration:50s] mt-4">
                    {peopleImages.map((image, index) => (
                        <div
                            key={`reverse-${index}`}
                            className="relative mx-2 h-64 w-48 shrink-0 overflow-hidden rounded-2xl"
                        >
                            <div className="relative h-full w-full">
                                <Image
                                    fill
                                    alt={image.alt}
                                    className="object-cover"
                                    sizes="(max-width: 768px) 192px, 192px"
                                    src={image.src}
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>
        </section>
    )
}
