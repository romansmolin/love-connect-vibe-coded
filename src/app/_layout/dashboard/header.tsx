'use client'

import { Coins, PanelLeft } from 'lucide-react'
import Link from 'next/link'

import { useGetWalletQuery } from '@/entities/credit'
import { formatCredits } from '@/shared/lib/credits'
import { Button } from '@/shared/ui/button'
import { ModeSwitcher } from '@/shared/ui/mode-switcher'
import { useSidebar } from '@/shared/ui/sidebar'

const Header = () => {
    const { toggleSidebar, state } = useSidebar()
    const isCollapsed = state === 'collapsed'
    const { data: walletData } = useGetWalletQuery()
    const balance = walletData?.wallet.balance ?? 0

    return (
        <header className="flex h-16 shrink-0 items-center px-6 justify-between">
            <Button
                className="mr-4 h-10 w-10 bg-transparent border-1 border-primary"
                size="icon"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                variant="outline"
                onClick={toggleSidebar}
            >
                <PanelLeft className="h-4 w-4 text-primary dark:text-white" />
                <span className="sr-only">{isCollapsed ? 'Expand' : 'Collapse'} Sidebar</span>
            </Button>
            <div className="flex items-center gap-3">
                <Link
                    className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                    href="/wallet"
                    title="Your credit balance"
                >
                    <Coins className="h-4 w-4" />
                    {formatCredits(balance)}
                </Link>
                <ModeSwitcher />
            </div>
        </header>
    )
}

export default Header
