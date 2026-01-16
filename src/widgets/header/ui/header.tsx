'use client'

import React, { ReactNode } from 'react'

import { Header01 } from './blocks/header-01'
import { Header02 } from './blocks/header-02'
import { Header03 } from './blocks/header-03'
import { Header04 } from './blocks/header-04'

type NavigationItem = {
    title: string
    href: string
}

export interface HeaderProps {
    variant: number
    navigationData: NavigationItem[]
    actions?: ReactNode
    showModeToggle?: boolean
}

const headerVariants: Record<number, React.ComponentType<Omit<HeaderProps, 'variant'>>> = {
    1: Header01,
    2: Header02,
    3: Header03,
    4: Header04,
}

export const Header = ({ variant, ...props }: HeaderProps) => {
    const HeaderComponent = headerVariants[variant] || Header01
    return <HeaderComponent {...props} />
}
