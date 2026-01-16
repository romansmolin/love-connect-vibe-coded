'use client'

import React, { useState } from 'react'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'
import { ModeSwitcher } from '@/shared/ui/mode-switcher'

import { Logo } from '../logo'

type NavigationItem = {
    title: string
    href: string
}

interface Header02Props {
    navigationData: NavigationItem[]
    actions?: React.ReactNode
    showModeToggle?: boolean
}

export const Header02 = ({ navigationData, actions, showModeToggle = true }: Header02Props) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <>
            <header className="flex flex-col px-4 py-2 backdrop-blur-3xl mx-auto border border-primary/20 rounded-xl shadow-inner bg-opacity-15 w-[90%] xl:w-[75%] top-5 sticky z-40 justify-between items-center p-2 bg-card">
                <div className="w-full flex justify-between items-center h-10 md:h-auto">
                    <Link className="text-primary p-1 md:p-2 flex gap-3 items-center" href="/">
                        <div className="rounded-md p-1 bg-primary">
                            <Logo className="size-8 md:size-10 text-primary-foreground" />
                        </div>
                        <span className="text-md md:text-xl font-bold">LoveConnect</span>
                    </Link>

                    {/* Navigation for large screens */}
                    <div className="hidden lg:flex gap-10">
                        {navigationData.map((item) => (
                            <Link
                                key={item.href}
                                className="text-lg font-medium hover:text-primary transition-colors"
                                href={item.href}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>

                    {/* Actions & Mobile menu button */}
                    <div className="flex items-center gap-2">
                        {actions}
                        {showModeToggle && <ModeSwitcher />}
                        <Button
                            aria-controls="landing-mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            className="lg:hidden"
                            size="icon"
                            variant="outline"
                            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </Button>
                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed w-screen inset-0 z-50 backdrop-blur-md bg-background/80 flex flex-col items-center justify-center space-y-8"
                    id="landing-mobile-menu"
                >
                    <button
                        className="absolute top-4 right-4 p-2"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>

                    {navigationData.map((item) => (
                        <Link
                            key={item.href}
                            className="text-2xl font-bold hover:text-primary transition-colors"
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.title}
                        </Link>
                    ))}

                    {actions && (
                        <div className="flex gap-3 mt-4" onClick={() => setMobileMenuOpen(false)}>
                            {actions}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

