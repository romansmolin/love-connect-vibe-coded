import React, { ReactNode } from 'react'

import Features3 from './feature-3'
import Features1 from './features-1'
import Features2 from './features-2'
import Features4 from './features-4'
import Features5 from './features-5'

const featuresVariants: Record<number, ReactNode> = {
    1: <Features1 />,
    2: <Features2 />,
    3: <Features3 />,
    4: <Features4 />,
    5: <Features5 />,
}

export const Features = ({ variant }: { variant: number }) => {
    return featuresVariants[variant]
}
