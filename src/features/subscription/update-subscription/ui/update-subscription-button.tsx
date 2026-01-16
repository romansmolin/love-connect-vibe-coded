'use client'

import React from 'react'

import { Loader2 } from 'lucide-react'

import { GenericDialog } from '@/shared/components'
import { Button } from '@/shared/ui/button'

import { BILLING_OPTIONS, PLAN_OPTIONS } from '../const/plan-options'
import { useUpdateSubscriptionPlan } from '../hooks/use-update-subscription-plan'
import { normalizePlanName, normalizePlanType } from '../utils/utils'

import { CadenceOptionButton } from './cadence-option-button'
import { PlanOptionButton } from './plan-option-button'

interface UpdateSubscriptionButtonProps {
    currentPlanName?: string | null
    currentPlanType?: string | null
    requiresCheckout?: boolean
}

export const UpdateSubscriptionButton = ({
    currentPlanName,
    currentPlanType,
    requiresCheckout = false,
}: UpdateSubscriptionButtonProps) => {
    const currentPlan = normalizePlanName(currentPlanName)
    const currentCadence = normalizePlanType(currentPlanType)

    const {
        handlePlanUpdate,
        setSelectedPlan,
        selectedCadence,
        selectedPlan,
        setSelectedCadence,
        isUpdateDisabled,
        isDirty,
        isUpdatingSubscription,
    } = useUpdateSubscriptionPlan(currentPlan, currentCadence, requiresCheckout)

    const helperText = requiresCheckout
        ? 'Pick a plan and billing cadence to continue to checkout.'
        : isDirty
          ? 'Review your new plan and billing cadence before confirming.'
          : 'Select a plan or billing cadence to enable updates.'

    const dialogContent = (
        <div className="flex flex-col gap-5">
            <div className="grid gap-3">
                {PLAN_OPTIONS.map((option) => (
                    <PlanOptionButton
                        key={option.value}
                        disabled={isUpdatingSubscription}
                        isCurrent={currentPlan === option.value}
                        isSelected={selectedPlan === option.value}
                        option={option}
                        onSelect={() => setSelectedPlan(option.value)}
                    />
                ))}
            </div>

            <div className="space-y-2">
                <p className="text-sm font-semibold">Billing cadence</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {BILLING_OPTIONS.map((option) => (
                        <CadenceOptionButton
                            key={option.value}
                            disabled={isUpdatingSubscription}
                            isCurrent={currentCadence === option.value}
                            isSelected={selectedCadence === option.value}
                            option={option}
                            onSelect={() => setSelectedCadence(option.value)}
                        />
                    ))}
                </div>
            </div>

            <p className="text-xs text-muted-foreground">{helperText}</p>
        </div>
    )

    return (
        <>
            <GenericDialog
                dialogContent={dialogContent}
                dialogHeaderDescription={'Switch between Starter and Pro whenever you need.'}
                dialogHeaderTitle={'Update subscription'}
                dialogFooter={
                    <Button className="w-full" disabled={isUpdateDisabled} size={'lg'} onClick={handlePlanUpdate}>
                        {isUpdatingSubscription && <Loader2 className="h-4 w-4 animate-spin" />}
                        Update plan
                    </Button>
                }
                dialogTriggerComp={
                    <Button size="lg" variant="outline">
                        Update Plan
                    </Button>
                }
            />
        </>
    )
}
