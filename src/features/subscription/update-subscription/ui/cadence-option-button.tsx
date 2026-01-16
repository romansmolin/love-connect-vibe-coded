import { CheckCircle2 } from 'lucide-react'

import { BillingOption } from '@/entities/subscription'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'

interface CadenceOptionButtonProps {
    option: BillingOption
    isSelected: boolean
    isCurrent: boolean
    disabled: boolean
    onSelect: () => void
}

export const CadenceOptionButton = ({
    option,
    isSelected,
    isCurrent,
    disabled,
    onSelect,
}: CadenceOptionButtonProps) => {
    return (
        <button
            disabled={disabled}
            type="button"
            className={cn(
                'w-full rounded-lg border p-3 text-left transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-80',
                isSelected ? 'border-primary bg-primary/5 shadow-xs' : 'border-border bg-background'
            )}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold">{option.title}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                    {option.savings && <p className="text-xs text-primary mt-1">{option.savings}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {isCurrent && (
                        <Badge className="text-xs" variant="outline">
                            Current
                        </Badge>
                    )}
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
            </div>
        </button>
    )
}
