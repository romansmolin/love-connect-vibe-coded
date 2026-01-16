import * as React from 'react'

import { cva } from 'class-variance-authority'

import { cn } from '../lib/utils'

interface EnhanceInputpProps extends Omit<React.ComponentProps<'input'>, 'size'> {
    size?: 'lg'
}

function Input({ className, type, size, ...props }: EnhanceInputpProps) {
    const inputVariant = cva(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-primary/20 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:border-primary transition-all duration-300',
        {
            variants: {
                size: {
                    lg: 'h-11 sm:h-10 rounded-md px-6 has-[>svg]:px-4',
                },
            },
        }
    )

    return <input className={cn(inputVariant({ size }), className)} data-slot="input" type={type} {...props} />
}

export { Input }
