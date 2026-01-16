import React from 'react'

import { CheckCircle2 } from 'lucide-react'

import { PlanOption } from '@/entities/subscription'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'

interface PlanOptionButtonProps {
    option: PlanOption
    isSelected: boolean
    isCurrent: boolean
    disabled: boolean
    onSelect: () => void
}

export const PlanOptionButton = ({ option, isSelected, isCurrent, disabled, onSelect }: PlanOptionButtonProps) => {
    return (
        <button
            disabled={disabled}
            type="button"
            className={cn(
                'w-full rounded-lg border p-4 text-left transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-80',
                isSelected ? 'border-primary bg-primary/5 shadow-xs' : 'border-border bg-background'
            )}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-base font-semibold">{option.title}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {isCurrent && (
                        <Badge className="text-xs" variant="outline">
                            Current
                        </Badge>
                    )}
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
            </div>
            {option.highlights.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {option.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                    ))}
                </ul>
            )}
        </button>
    )
}
