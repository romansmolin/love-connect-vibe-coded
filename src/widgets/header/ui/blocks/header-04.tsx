'use client'

import React, { useState } from 'react'

import { ArrowRight, Menu as MenuIcon, X } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'
import { ShimmerButton } from '@/shared/ui/shimmer-button'

import { Logo } from '../logo'

type NavigationItem = {
    title: string
    href: string
}

interface Header04Props {
    navigationData: NavigationItem[]
    actions?: React.ReactNode
}

export const Header04 = ({ navigationData, actions }: Header04Props) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [hoveredLink, setHoveredLink] = useState<string | null>(null)

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link className="flex items-center gap-2" href="/">
                        <div className="relative overflow-hidden rounded-xl">
                            <Logo className="h-8 w-8" />
                        </div>
                        <h2 className="font-pacifico text-3xl text-primary">LoveConnect</h2>
                    </Link>

                    {/* Desktop Navigation with Hover Effects */}
                    <nav className="hidden items-center gap-1 lg:flex">
                        {navigationData.map((item) => (
                            <Link
                                key={item.href}
                                className="group relative px-4 py-2"
                                href={item.href}
                                onMouseEnter={() => setHoveredLink(item.href)}
                                onMouseLeave={() => setHoveredLink(null)}
                            >
                                <span
                                    className={`relative z-10 text-sm font-medium transition-colors ${
                                        hoveredLink === item.href ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                                >
                                    {item.title}
                                </span>
                                {hoveredLink === item.href && (
                                    <span className="absolute inset-0 rounded-lg bg-primary/10 transition-all" />
                                )}
                                <span
                                    className={`absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gradient-to-r from-primary to-pink-500 transition-all duration-300 ${
                                        hoveredLink === item.href ? 'w-1/2' : 'w-0'
                                    }`}
                                />
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden items-center gap-3 lg:flex">{actions}</div>

                    {/* Mobile Menu Button */}
                    <Button
                        className="lg:hidden"
                        size="icon"
                        variant="outline"
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <MenuIcon className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Full Screen Mobile Menu */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-[60] flex flex-col bg-background">
                    {/* Close Button */}
                    <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
                        <Link className="flex items-center gap-3" href="/" onClick={() => setIsMobileOpen(false)}>
                            <Logo className="h-8 w-8" />
                            <span className="text-lg font-bold">LoveConnect</span>
                        </Link>
                        <Button size="icon" variant="ghost" onClick={() => setIsMobileOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Mobile Nav Links */}
                    <nav className="flex flex-1 flex-col justify-center gap-4 px-8">
                        {navigationData.map((item, index) => (
                            <Link
                                key={item.href}
                                className="group flex items-center justify-between border-b border-border/30 py-4 text-2xl font-semibold transition-colors hover:text-primary"
                                href={item.href}
                                style={{
                                    animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                                }}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                {item.title}
                                <ArrowRight className="h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile CTA */}
                    {actions ? <div className="border-t border-border/50 p-6 space-y-3">{actions}</div> : null}
                    <div className="border-t border-border/50 p-6">
                        <Link className="block" href="#pricing" onClick={() => setIsMobileOpen(false)}>
                            <ShimmerButton
                                background="linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)"
                                className="h-14 w-full gap-2 text-base font-semibold"
                                shimmerColor="#ffffff"
                                shimmerDuration="2s"
                                shimmerSize="0.08em"
                            >
                                Get Started Free
                                <ArrowRight className="h-5 w-5" />
                            </ShimmerButton>
                        </Link>
                    </div>
                </div>
            )}
        </>
    )
}
