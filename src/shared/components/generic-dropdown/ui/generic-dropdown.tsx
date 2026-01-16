import React, { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

interface GenericDropdownProps<TItem> {
    trigger: ReactNode
    items: TItem[]
    renderItem: (item: TItem, index: number) => ReactNode
    label?: ReactNode
    contentClassName?: string
    withSeparator?: boolean
    getItemKey?: (item: TItem, index: number) => React.Key
}

export function GenericDropdown<TItem>({
    trigger,
    items,
    renderItem,
    label,
    contentClassName = '',
    withSeparator = false,
}: GenericDropdownProps<TItem>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

            <DropdownMenuContent className={cn(contentClassName)}>
                {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}

                {withSeparator && <DropdownMenuSeparator />}

                {items.map((item, index) => (
                    <DropdownMenuItem key={index} asChild className="cursor-pointer">
                        {renderItem(item, index)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
