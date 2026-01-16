'use client'

import { useCallback } from 'react'

import { toast } from 'sonner'

import { useCancelSubscriptionMutation } from '@/entities/subscription'

interface UseCancelSubscriptionResult {
    cancelSubscription: () => Promise<void>
    isCancellingSubscription: boolean
}

export const useCancelSubscription = (): UseCancelSubscriptionResult => {
    const [triggerCancel, { isLoading }] = useCancelSubscriptionMutation()

    const cancelSubscription = useCallback(async () => {
        try {
            await triggerCancel().unwrap()
            toast.success('Your subscription has been cancelled.')
        } catch (error) {
            toast.error('Could not cancel your subscription. Please try again.')
            throw error
        }
    }, [triggerCancel])

    return {
        cancelSubscription,
        isCancellingSubscription: isLoading,
    }
}
