import * as React from 'react'

import { cn } from '../lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('bg-card p-6 text-card-foreground flex flex-col gap-6 rounded-xl border', className)}
            data-slot="card"
            {...props}
        />
    )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
                className
            )}
            {...props}
        />
    )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('leading-none font-bold text-primary dark:text-white"', className)}
            data-slot="card-title"
            {...props}
        />
    )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('text-black dark:text-white text-sm', className)}
            data-slot="card-description"
            {...props}
        />
    )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
            data-slot="card-action"
            {...props}
        />
    )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('', className)} data-slot="card-content" {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div className={cn('flex items-center [.border-t]:pt-6', className)} data-slot="card-footer" {...props} />
    )
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
