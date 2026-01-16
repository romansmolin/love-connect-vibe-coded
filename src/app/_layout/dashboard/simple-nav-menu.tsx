'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/shared/lib/utils'
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/shared/ui/sidebar'

interface NavItem {
    title: string
    url: string
    icon?: React.ElementType
    items?: NavItem[]
    isActive?: boolean
    badge?: React.ReactNode
}

interface NavMenuGroupProps {
    title: string
    items: NavItem[]
}

export function SimpleNavMenu({ title, items }: NavMenuGroupProps) {
    const { state, setOpenMobile, isMobile } = useSidebar()
    const pathname = usePathname()
    const isCollapsed = state === 'collapsed'

    // Track open state for each menu
    const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({})

    // Toggle menu open state
    const toggleMenu = (menuTitle: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuTitle]: !prev[menuTitle],
        }))
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel className={cn(isCollapsed && 'justify-center text-center')}>
                {title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        // If the item has subitems, render a menu with submenu
                        if (item.items && item.items.length > 0) {
                            const isOpen = openMenus[item.title] || false

                            return (
                                <div key={item.title} className="w-full">
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            className={cn('h-[35px]', isCollapsed && 'justify-center')}
                                            tooltip={item.title}
                                            onClick={() => toggleMenu(item.title)}
                                        >
                                            {item.icon && <item.icon className="size-4" />}
                                            {!isCollapsed && <span>{item.title}</span>}
                                            {!isCollapsed && (
                                                <ChevronDown
                                                    className={cn(
                                                        'ml-auto size-4 transition-transform',
                                                        isOpen && 'rotate-180'
                                                    )}
                                                />
                                            )}
                                        </SidebarMenuButton>

                                        {isOpen && (
                                            <SidebarMenuSub>
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={subItem.isActive}
                                                        >
                                                            <Link href={subItem.url}>
                                                                {subItem.icon && (
                                                                    <subItem.icon className="mr-2 size-3" />
                                                                )}
                                                                {subItem.title}
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        )}
                                    </SidebarMenuItem>
                                </div>
                            )
                        }

                        // Otherwise, render a regular menu item
                        return (
                            <SidebarMenuItem key={item.title} className="flex justify-between">
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.url}
                                    tooltip={item.title}
                                    className={cn(
                                        'h-[35px] active:bg-primary',
                                        isCollapsed && 'justify-center'
                                    )}
                                >
                                    <Link
                                        className="flex justify-between items-center gap-2"
                                        href={item.url}
                                        onClick={isMobile ? () => setOpenMobile(false) : () => {}}
                                    >
                                        <span className="flex gap-2 items-center">
                                            {item.icon && <item.icon className="size-4" />}
                                            {!isCollapsed && <span>{item.title}</span>}
                                        </span>
                                        {item.badge && !isCollapsed && item.badge}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
