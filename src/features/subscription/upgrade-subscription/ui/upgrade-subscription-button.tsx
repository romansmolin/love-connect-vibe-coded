'use client'

import React from 'react'

import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/shared/ui/button'

interface UpgradeSubscriptionButtonProps extends Partial<React.ComponentProps<'button'>> {
    icon?: React.ReactNode
    size?: 'sm' | 'lg'
    variant?: 'outline' | 'default'
}

export const UpgradeSubscriptionButton = ({
    className,
    icon = <Sparkles className="mr-2 size-4" />,
    size = 'sm',
    variant = 'outline',
    ...props
}: UpgradeSubscriptionButtonProps) => {
    const router = useRouter()

    return (
        <Button
            className={className}
            size={size}
            variant={variant}
            onClick={() => router.push('/pricing')}
            {...props}
        >
            {icon}
            Upgrade to Pro
        </Button>
    )
}
