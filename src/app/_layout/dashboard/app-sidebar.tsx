'use client'

import React from 'react'

import { BarChart3, Eye, Gift, Heart, LayoutDashboard, MessageCircle, Settings, UserRound, Wallet } from 'lucide-react'

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
            title: 'Discover',
            items: [
                {
                    title: 'Dashboard',
                    icon: LayoutDashboard,
                    url: '/dashborad',
                },
                {
                    title: 'Matches',
                    icon: Heart,
                    url: '/matches',
                },
                {
                    title: 'Who Liked You',
                    icon: Eye,
                    url: '/who-liked',
                },
                {
                    title: 'Analytics',
                    icon: BarChart3,
                    url: '/analytics',
                },
            ],
        },
        {
            title: 'Connect',
            items: [
                {
                    title: 'Messages',
                    icon: MessageCircle,
                    url: '/chat',
                },
                {
                    title: 'Buy Gifts',
                    icon: Gift,
                    url: '/gifts',
                },
            ],
        },
        {
            title: 'Account',
            items: [
                {
                    title: 'Wallet',
                    icon: Wallet,
                    url: '/wallet',
                },
                {
                    title: 'My Profile',
                    icon: UserRound,
                    url: '/profile',
                },
                {
                    title: 'Settings',
                    icon: Settings,
                    url: '/settings',
                },
            ],
        },
    ]

    return (
        <Sidebar className="!bg-transparent" collapsible="icon">
            <SidebarHeader className="">
                <div className="flex items-center gap-3 pt-2">
                    <Logo className="size-10 md:size-10" />

                    {!isCollapsed && <h2 className="text-lg font-semibold">LoveBond</h2>}
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
