'use client'

import { useCallback, useState } from 'react'

import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

import { creditApi, usePurchaseCreditsMutation } from '@/entities/credit'
import { openSecureProcessorWidget } from '@/shared/lib/secure-processor-widget'

const resolveErrorMessage = (error: unknown) => {
    if (!error || typeof error !== 'object') return 'Unable to start credit purchase.'
    if ('data' in error) {
        const payload = (error as { data?: { message?: string } }).data
        if (payload?.message) return payload.message
    }
    return 'Unable to start credit purchase.'
}

export const useBuyCredits = () => {
    const [purchaseCredits, { isLoading }] = usePurchaseCreditsMutation()
    const dispatch = useDispatch()
    const [isConsentOpen, setIsConsentOpen] = useState(false)
    const [consentChecked, setConsentChecked] = useState(false)
    const [pendingCredits, setPendingCredits] = useState<number | null>(null)

    const buyCredits = useCallback(
        async (credits: number) => {
            try {
                const response = await purchaseCredits({ credits }).unwrap()
                toast.success('Payment started. Complete checkout to receive credits.')

                if (response.checkoutToken) {
                    try {
                        await openSecureProcessorWidget({
                            checkoutToken: response.checkoutToken,
                            onClose: (status) => {
                                if (status === 'successful') {
                                    dispatch(creditApi.util.invalidateTags(['CreditWallet']))
                                    toast.success('Payment confirmed. Credits added to your wallet.')
                                }
                                if (status === 'failed' || status === 'error') {
                                    toast.error('Payment failed. Please try again.')
                                }
                            },
                        })
                    } catch (error) {
                        console.error('[credit-purchase] widget error', error)
                        toast.error('Unable to open the payment widget.')
                    }
                } else {
                    toast.error('Checkout token missing. Please try again.')
                }

                return response
            } catch (error) {
                const message = resolveErrorMessage(error)
                toast.error(message)
                throw error
            }
        },
        [dispatch, purchaseCredits]
    )

    const requestConsent = useCallback((credits: number) => {
        setPendingCredits(credits)
        setConsentChecked(false)
        setIsConsentOpen(true)
    }, [])

    const closeConsent = useCallback(() => {
        setIsConsentOpen(false)
        setConsentChecked(false)
        setPendingCredits(null)
    }, [])

    const confirmConsent = useCallback(async () => {
        if (!pendingCredits) return
        if (!consentChecked) {
            toast.error('Please accept the Terms, Privacy Policy, and Return Policy to continue.')
            return
        }

        try {
            await buyCredits(pendingCredits)
        } finally {
            setIsConsentOpen(false)
            setConsentChecked(false)
            setPendingCredits(null)
        }
    }, [buyCredits, consentChecked, pendingCredits])

    return {
        buyCredits,
        isLoading,
        isConsentOpen,
        consentChecked,
        setConsentChecked,
        requestConsent,
        closeConsent,
        confirmConsent,
    }
}

export type UseBuyCreditsReturn = ReturnType<typeof useBuyCredits>
