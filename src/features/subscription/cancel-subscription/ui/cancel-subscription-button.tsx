'use client'

import React from 'react'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { GenericDialog } from '@/shared/components'
import { Button } from '@/shared/ui/button'

import { useCancelSubscription } from '../hooks/use-cancel-subscription'

export const CancelSubscriptionButton = () => {
    const { cancelSubscription, isCancellingSubscription } = useCancelSubscription()

    const router = useRouter()

    const handleSubmit = async () => {
        await cancelSubscription()
        router.refresh()
    }

    const dialogContent = (
        <div className="flex gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>
                This action cannot be undone. You may lose access to scheduled posts and premium automations when
                the period ends.
            </p>
        </div>
    )

    const dialogFooter = (
        <Button disabled={isCancellingSubscription} type="button" variant="destructive" onClick={handleSubmit}>
            {isCancellingSubscription && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm cancellation
        </Button>
    )

    return (
        <>
            <GenericDialog
                dialogContent={dialogContent}
                dialogFooter={dialogFooter}
                dialogHeaderTitle={'Cancel subscription'}
                dialogHeaderDescription={
                    'Cancelling now will immediately stop renewals. You will keep access until your current billing period ends.'
                }
                dialogTriggerComp={
                    <Button size="lg" variant="destructive">
                        Cancel Subscription
                    </Button>
                }
            />
        </>
    )
}
