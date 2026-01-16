'use client'

import React, { ReactNode } from 'react'

import { BeforeAfter01 } from './blocks/before-after-01'
import { BeforeAfter02 } from './blocks/before-after-02'

const beforeAfterVariants: Record<number, ReactNode> = {
    1: <BeforeAfter01 />,
    2: <BeforeAfter02 />,
}

export interface BeforeAfterProps {
    variant: number
}

export const BeforeAfter = ({ variant }: BeforeAfterProps) => {
    return beforeAfterVariants[variant] || <BeforeAfter01 />
}
