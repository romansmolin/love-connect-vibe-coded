import React, { ReactNode } from 'react'

import { Testimonials01 } from './testimonials01'
import { Testimonials02 } from './testimonials02'

const testimonialVariants: Record<number, ReactNode> = {
    1: <Testimonials01 />,
    2: <Testimonials02 />,
}

export const Testimonial = ({ variant }: { variant: number }) => {
    return testimonialVariants[variant]
}
