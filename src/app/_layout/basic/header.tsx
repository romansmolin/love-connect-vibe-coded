'use client'

import React, { ReactNode, useState } from 'react'

import { Menu, PlaneIcon, X } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'
import { ModeSwitcher } from '@/shared/ui/mode-switcher'

interface HeaderProps {
    isAuth?: boolean
    children?: ReactNode
    showModeToggle?: boolean
}

const Header = ({ isAuth, children, showModeToggle = true }: HeaderProps) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <>
            <header className="flex flex-col px-4 py-2 backdrop-blur-3xl mx-auto border-1 border-primary rounded-xl shadow-inner bg-opacity-15 w-[90%] xl:w-[75%] top-5 sticky z-40 justify-between items-center p-2 bg-card">
                <div className="w-full flex justify-between items-center h-10 md:h-auto">
                    <Link className="text-primary p-1 md:p-2 flex gap-3 items-center" href={'/'}>
                        {/* <Logo className="size-10 md:size-12" /> */}
                        <div className="rounded-md p-1/2 bg-primary">
                            <PlaneIcon className="size-10 md:size-12 fill-white" />
                        </div>
                        <span className="text-md md:text-xl font-bold italic">OrbitReach</span>
                    </Link>

                    {/* Navigation for large screens */}
                    {!isAuth && (
                        <div className="hidden lg:flex gap-10">
                            <Link className="text-xl font-bold" href="#pricing">
                                Pricing
                            </Link>
                            <Link className="text-xl font-bold" href="#testimonials">
                                Reviews
                            </Link>
                            <Link className="text-xl font-bold" href="#features">
                                Features
                            </Link>
                            <Link className="text-xl font-bold" href="#faq">
                                FAQ
                            </Link>
                            <Link className="text-xl font-bold" href="/blog">
                                Blog
                            </Link>
                        </div>
                    )}

                    {/* Login button for large screens */}
                    {/* <div className="hidden lg:flex gap-2">
                        {children}
                        <ModeSwitcher />
                    </div> */}

                    {/* Hamburger menu button for mobile */}
                    {!isAuth && (
                        <div className="flex items-center gap-2">
                            {children}
                            {showModeToggle && <ModeSwitcher />}
                            <Button
                                aria-controls="landing-mobile-menu"
                                aria-expanded={isMobileMenuOpen}
                                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                                className="lg:hidden"
                                size={'icon'}
                                variant={'outline'}
                                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {isMobileMenuOpen && !isAuth && (
                <div
                    id="landing-mobile-menu"
                    className="lg:hidden fixed
                     w-screen inset-0 z-50 backdrop-blur-md flex flex-col items-center justify-center space-y-8"
                >
                    <button className="absolute top-4 right-4" onClick={() => setMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>

                    {!isAuth && (
                        <>
                            <Link
                                className="text-2xl font-bold"
                                href="#pricing"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>
                            <Link
                                className="text-2xl font-bold"
                                href="#testimonials"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Reviews
                            </Link>
                            <Link
                                className="text-2xl font-bold"
                                href="#features"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                className="text-2xl font-bold"
                                href="#faq"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                FAQ
                            </Link>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

export default Header
