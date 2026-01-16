import React, { ReactNode } from 'react'

import { HeroSection01 } from './blocks/hero-section-01'
import HeroSections02 from './blocks/hero-section-02'
import { HeroSection03 } from './blocks/hero-section-03'
import { HeroSection04 } from './blocks/hero-section-04'

const herosSectionsVariant: Record<number, ReactNode> = {
    1: <HeroSection01 />,
    2: <HeroSections02 />,
    3: <HeroSection03 />,
    4: <HeroSection04 />,
}

export const HeroSection = ({ variant }: { variant: number }) => {
    return herosSectionsVariant[variant]
}
