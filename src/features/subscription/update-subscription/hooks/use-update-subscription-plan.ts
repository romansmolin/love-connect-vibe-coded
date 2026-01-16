'use client'

import { Dispatch, SetStateAction, useCallback, useState } from 'react'

import { toast } from 'sonner'

import {
    BillingCadence,
    STRIPE_LINKS,
    SubscriptionPlanName,
    useUpdateUserPlanMutation,
} from '@/entities/subscription'
import { useGetUserInfoQuery } from '@/entities/user'

import { appendClientReferenceId } from '../utils/utils'

interface UpdateSubscriptionParams {
    planName: SubscriptionPlanName
    planType?: BillingCadence
}

interface UseUpdateSubscriptionPlanResult {
    handlePlanUpdate: () => void
    selectedPlan: SubscriptionPlanName | null
    selectedCadence: BillingCadence | null
    setSelectedPlan: Dispatch<SetStateAction<SubscriptionPlanName | null>>
    setSelectedCadence: Dispatch<SetStateAction<BillingCadence | null>>
    isUpdateDisabled: boolean
    isDirty: boolean
    isUpdatingSubscription: boolean
}

const getCheckoutLink = (plan: SubscriptionPlanName, cadence: BillingCadence) => STRIPE_LINKS[plan]?.[cadence]
const DEFAULT_CADENCE: BillingCadence = 'monthly'

export const useUpdateSubscriptionPlan = (
    currentPlan: SubscriptionPlanName | null,
    currentCadence: BillingCadence | null,
    requiresCheckout: boolean
): UseUpdateSubscriptionPlanResult => {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanName | null>(null)
    const [selectedCadence, setSelectedCadence] = useState<BillingCadence | null>(null)

    const [triggerUpdate, { isLoading }] = useUpdateUserPlanMutation()
    const { data: userInfo } = useGetUserInfoQuery()
    const userId = userInfo?.user?.id

    const updateSubscriptionPlan = useCallback(
        async ({ planName, planType }: UpdateSubscriptionParams) => {
            const formattedPlanName = planName === 'PRO' ? 'Pro' : 'Starter'

            try {
                await triggerUpdate({ planName, planType }).unwrap()
                if (planType) {
                    const cadenceLabel = planType === 'monthly' ? 'monthly' : 'yearly'
                    toast.success(`Plan updated to ${formattedPlanName} (${cadenceLabel})`)
                } else {
                    toast.success(`Plan updated to ${formattedPlanName}`)
                }
            } catch (error) {
                toast.error('Unable to update your subscription. Please try again.')
                throw error
            }
        },
        [triggerUpdate]
    )

    const hasCadenceChanged = Boolean(selectedCadence && selectedCadence !== currentCadence)
    const hasPlanChanged = Boolean(selectedPlan && selectedPlan !== currentPlan)

    const isDirty = requiresCheckout ? Boolean(selectedPlan) : hasCadenceChanged || hasPlanChanged
    const isUpdateDisabled = requiresCheckout ? !selectedPlan : !selectedPlan || !isDirty || isLoading

    const handlePlanUpdate = async () => {
        if (!selectedPlan) return

        if (requiresCheckout) {
            if (!userId) {
                toast.error('Unable to start checkout. Please try again in a moment.')
                return
            }

            const cadence = selectedCadence ?? DEFAULT_CADENCE
            const checkoutLink = getCheckoutLink(selectedPlan, cadence)

            if (!checkoutLink) {
                toast.error('Checkout link is unavailable. Please contact support.')
                return
            }

            const checkoutLinkWithReference = appendClientReferenceId(checkoutLink, userId)

            window.location.href = checkoutLinkWithReference

            return
        }

        const cadenceChanged = selectedCadence && selectedCadence !== currentCadence ? selectedCadence : undefined
        const planChanged = !currentPlan || selectedPlan !== currentPlan

        if (!planChanged && !cadenceChanged) return

        await updateSubscriptionPlan({
            planName: selectedPlan,
            planType: cadenceChanged,
        })
    }

    return {
        handlePlanUpdate,
        selectedPlan,
        selectedCadence,
        setSelectedPlan,
        setSelectedCadence,
        isUpdateDisabled,
        isDirty,
        isUpdatingSubscription: isLoading,
    }
}
