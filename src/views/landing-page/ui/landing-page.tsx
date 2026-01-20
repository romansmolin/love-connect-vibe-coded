import React from 'react'

import { SignUpFormSection } from '@/widgets/auth'

import { BeforeAfter } from './before-after/before-after'
import Faq2 from './faq/faq2'
import { Features } from './features/features'
import { HeroSection } from './hero-section/hero-section'
import { Testimonial } from './testimonials/testimonial'

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
            <Testimonial variant={2} />
            <Faq2 />
        </>
    )
}

export default LandingPage
