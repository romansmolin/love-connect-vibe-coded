'use client'

import React from 'react'

import { Heart, LayoutDashboard } from 'lucide-react'

import { UserCard } from '@/entities/user'
import { cn } from '@/shared/lib/utils'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    useSidebar,
} from '@/shared/ui/sidebar'

import Logo from '../basic/logo'

import { SimpleNavMenu } from './simple-nav-menu'

const AppSidebar = () => {
    const { state } = useSidebar()
    const isCollapsed = state === 'collapsed'

    const menuGroups = [
        {
            title: 'Workspace',
            items: [
                {
                    title: 'Dashboard',
                    icon: LayoutDashboard,
                    url: '/dashboard',
                },
                {
                    title: 'Matches',
                    icon: Heart,
                    url: '/matches',
                },
            ],
        },
    ]

    return (
        <Sidebar className="!bg-transparent" collapsible="icon">
            <SidebarHeader className="">
                <div className="flex items-center gap-3 pt-2">
                    <Logo className="size-10 md:size-10" />

                    {!isCollapsed && <h2 className="text-lg font-semibold">OrbitReach</h2>}
                </div>
            </SidebarHeader>

            <SidebarContent>
                {menuGroups.map((group) => (
                    <SimpleNavMenu key={group.title} items={group.items} title={group.title} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <div className={cn(!isCollapsed && 'p-2')}>
                    <UserCard />
                </div>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}

export default AppSidebar
