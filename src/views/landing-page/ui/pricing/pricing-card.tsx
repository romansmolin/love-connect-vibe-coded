import React from 'react'

import { ArrowUpRight, CircleCheck, CircleHelp } from 'lucide-react'

import { GenericCard } from '@/shared/components/generic-card'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface PlanFeature {
    title: string
    tooltip?: string
}

export interface PricingPlan {
    name: string
    price: number
    description: string
    features: PlanFeature[]
    isPopular?: boolean
    stripeMonthlyLink?: string
    stripeYearlyLink?: string
}

interface PricingCardProps {
    plan: PricingPlan
    selectedBillingPeriod: 'monthly' | 'yearly'
    yearlyDiscount: number
    onSelect: (plan: PricingPlan) => void
    className?: string
}

export const PricingCard = ({
    plan,
    selectedBillingPeriod,
    yearlyDiscount,
    onSelect,
    className,
}: PricingCardProps) => {
    const calculatedPrice =
        selectedBillingPeriod === 'monthly' ? plan.price : Math.round(plan.price * ((100 - yearlyDiscount) / 100))

    const pricingCardHeader = (
        <>
            {plan.isPopular && (
                <Badge className="absolute bg-primary top-13 right-13 rotate-[45deg] rounded-none px-10 uppercase translate-x-1/2 -translate-y-1/2">
                    Most Popular
                </Badge>
            )}
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-medium">{plan.name}</h2>
                <p className="mt-2 text-4xl font-bold">
                    ${calculatedPrice}
                    <span className="ml-1.5 text-sm text-muted-foreground font-normal">/month</span>
                </p>
                <p className="mt-4 font-medium text-muted-foreground">{plan.description}</p>

                <Button
                    className="w-full mt-6 text-base hover:scale-110"
                    size="lg"
                    variant={plan.isPopular ? 'default' : 'outline'}
                    onClick={() => onSelect(plan)}
                >
                    Get Started <ArrowUpRight className="w-4 h-4" />
                </Button>
            </div>
        </>
    )

    const pricingCardContent = (
        <>
            <Separator className="my-8" />
            <ul className="space-y-3">
                {plan.features.map((feature) => (
                    <li key={feature.title} className="flex items-start gap-1.5">
                        <CircleCheck className="h-4 w-4 mt-1 text-green-600" />
                        {feature.title}
                        {feature.tooltip && (
                            <Tooltip>
                                <TooltipTrigger aria-label="Tooltip Info" className="cursor-help">
                                    <CircleHelp className="h-4 w-4 mt-1 text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent>{feature.tooltip}</TooltipContent>
                            </Tooltip>
                        )}
                    </li>
                ))}
            </ul>
        </>
    )
    return (
        <GenericCard
            cardContent={pricingCardContent}
            cardHeader={pricingCardHeader}
            cardContainerClassName={cn(
                'relative p-6 bg-background border px-8 gap-2 overflow-hidden animate-fade-left flex-1 h-full',
                className
            )}
        />
    )
}
