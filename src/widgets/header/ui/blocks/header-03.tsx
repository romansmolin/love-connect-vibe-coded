'use client'

import React, { useState } from 'react'

import { Menu as MenuIcon, Sparkles, X } from 'lucide-react'
import Link from 'next/link'

import { BorderBeam } from '@/shared/ui/border-beam'
import { Button } from '@/shared/ui/button'
import { AnimatedShinyText } from '@/shared/ui/animated-shiny-text'

import { Logo } from '../logo'

type NavigationItem = {
    title: string
    href: string
}

interface Header03Props {
    navigationData: NavigationItem[]
    actions?: React.ReactNode
}

export const Header03 = ({ navigationData, actions }: Header03Props) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            <header className="fixed top-4 left-1/2 z-50 w-[95%] max-w-5xl -translate-x-1/2">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl">
                    {/* Border Beam Effect */}
                    <BorderBeam
                        colorFrom="#7c3aed"
                        colorTo="#ec4899"
                        duration={8}
                        size={80}
                    />

                    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                        {/* Logo & Brand */}
                        <Link className="flex items-center gap-3" href="/">
                            <Logo className="h-8 w-8" />
                            <AnimatedShinyText className="text-lg font-bold" shimmerWidth={150}>
                                LoveConnect
                            </AnimatedShinyText>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center gap-1 md:flex">
                            {navigationData.map((item) => (
                                <Link
                                    key={item.href}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                    href={item.href}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block">{actions}</div>
                            <Button
                                className="md:hidden"
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsMobileOpen(true)}
                            >
                                <MenuIcon className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl">
                    <div className="flex h-full flex-col">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
                            <Link className="flex items-center gap-3" href="/" onClick={() => setIsMobileOpen(false)}>
                                <Logo className="h-8 w-8" />
                                <span className="text-lg font-bold">LoveConnect</span>
                            </Link>
                            <Button size="icon" variant="ghost" onClick={() => setIsMobileOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="flex flex-1 flex-col gap-2 p-4">
                            {navigationData.map((item, index) => (
                                <Link
                                    key={item.href}
                                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-4 text-lg font-medium transition-all hover:border-primary/50 hover:bg-primary/5"
                                    href={item.href}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    {item.title}
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile Actions */}
                        {actions && (
                            <div className="border-t border-border/50 p-4">
                                <div onClick={() => setIsMobileOpen(false)}>{actions}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

