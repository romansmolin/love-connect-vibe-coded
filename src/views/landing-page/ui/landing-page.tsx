import React from 'react'

import { SignUpFormSection } from '@/widgets/auth'

import { BeforeAfter } from './before-after/before-after'
import Faq2 from './faq/faq2'
import { Features } from './features/features'
import { HeroSection } from './hero-section/hero-section'
import PricingSection from './pricing/pricing'

import { People } from './platforms'

const LandingPage = () => {
    return (
        <>
            <HeroSection variant={4} />
            <BeforeAfter variant={2} />
            <People />
            <div className="px-4">
                <Features variant={2} />
            </div>
            <div className="px-4">
                <Features variant={4} />
            </div>

            <SignUpFormSection />

            <div className="px-4">
                <Features variant={5} />
            </div>
            <PricingSection />
            <Faq2 />
        </>
    )
}

export default LandingPage
