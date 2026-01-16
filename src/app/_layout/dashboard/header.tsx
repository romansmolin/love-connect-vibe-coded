'use client'

import { PanelLeft } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { ModeSwitcher } from '@/shared/ui/mode-switcher'
import { useSidebar } from '@/shared/ui/sidebar'

const Header = () => {
    const { toggleSidebar, state } = useSidebar()
    const isCollapsed = state === 'collapsed'

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
            <ModeSwitcher />
        </header>
    )
}

export default Header
