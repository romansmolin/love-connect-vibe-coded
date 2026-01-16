import React from 'react'

import { Heart } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface LogoProps {
    className?: string
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={cn('p-2 bg-primary rounded-2xl flex justify-center items-center', className)}>
            <Heart className="text-white" />
        </div>
    )
}
