'use client'

import React, { useState } from 'react'

import { Menu as MenuIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'

import Logo from './logo'

type NavigationItem = {
    title: string
    href: string
}

interface Header01Props {
    navigationData: NavigationItem[]
    actions?: React.ReactNode
}

const Header01 = ({ navigationData, actions }: Header01Props) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const midpoint = Math.ceil(navigationData.length / 2)
    const leftLinks = navigationData.slice(0, midpoint)
    const rightLinks = navigationData.slice(midpoint)

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
            <div className="mx-auto flex w-full justify-between max-w-7xl gap-4 p-4 sm:px-6 md:items-center md:py-6">
                <Link className="text-foreground md:hidden" href="/">
                    <Logo className="h-9 w-9" />
                </Link>

                <div className="hidden md:block w-12"></div>

                <div className="hidden text-muted-foreground md:flex items-center gap-6 font-medium justify-center lg:gap-12">
                    {leftLinks.map((item) => (
                        <Link key={item.href} className="hover:text-primary" href={item.href}>
                            {item.title}
                        </Link>
                    ))}

                    <Link className="text-foreground" href="/">
                        <Logo className="h-9 w-9" />
                    </Link>

                    {rightLinks.map((item) => (
                        <Link key={item.href} className="hover:text-primary" href={item.href}>
                            {item.title}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center flex-end gap-3">
                    {actions}
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button size="icon" variant="outline">
                                <MenuIcon />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="flex flex-col gap-6" side="right">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-3">
                                    <Logo className="h-8 w-8" />
                                    <span className="text-lg font-semibold">LoveBond</span>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 text-base font-medium">
                                {navigationData.map((item) => (
                                    <Link
                                        key={item.href}
                                        className="hover:text-primary"
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                            {actions && (
                                <div className="flex flex-wrap gap-3">
                                    {React.Children.map(actions, (child) => (
                                        <div onClick={() => setIsMobileOpen(false)}>{child}</div>
                                    ))}
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

export default Header01
