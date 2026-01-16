import * as React from 'react'
import { cva,type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'

const alertVariants = cva(
    'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
    {
        variants: {
            variant: {
                default: 'bg-background text-foreground',
                destructive: 'bg-destructive text-destructive-foreground',
                warning:
                    'bg-yellow-100/60 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100 border-none',
                info: 'bg-blue-100/60 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100 border-none',
                tip: 'bg-green-100/60 text-green-900 dark:bg-green-900/30 dark:text-green-100 border-none',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

function Alert({
    className,
    variant,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
    return (
        <div
            className={cn(alertVariants({ variant }), className)}
            data-slot="alert"
            role="alert"
            {...props}
        />
    )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
            data-slot="alert-title"
            {...props}
        />
    )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
                className
            )}
            {...props}
        />
    )
}

export { Alert, AlertDescription,AlertTitle }
