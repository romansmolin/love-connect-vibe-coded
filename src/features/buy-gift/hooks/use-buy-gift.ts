'use client'

import { useCallback } from 'react'

import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

import type { Gift, PurchaseGiftResponse } from '@/entities/gift'
import { giftApi, usePurchaseGiftMutation } from '@/entities/gift'
import { openSecureProcessorWidget } from '@/shared/lib/secure-processor-widget'

const resolveErrorMessage = (error: unknown) => {
    if (!error || typeof error !== 'object') return 'Unable to start purchase.'
    if ('data' in error) {
        const payload = (error as { data?: { message?: string } }).data
        if (payload?.message) return payload.message
    }
    return 'Unable to start purchase.'
}

export const useBuyGift = () => {
    const [purchaseGift, { isLoading }] = usePurchaseGiftMutation()
    const dispatch = useDispatch()

    const buyGift = useCallback(
        async (gift: Gift): Promise<PurchaseGiftResponse> => {
            try {
                const response = await purchaseGift({ giftId: gift.id }).unwrap()
                toast.success(`Payment started for ${gift.name}. Complete checkout to unlock it.`)

                console.log('RESPONSE: ', response)

                if (response.checkoutToken) {
                    try {
                        await openSecureProcessorWidget({
                            checkoutToken: response.checkoutToken,
                            onClose: (status) => {
                                if (status === 'successful') {
                                    dispatch(giftApi.util.invalidateTags(['GiftInventory']))
                                    toast.success('Payment confirmed. Your gift is now available to send.')
                                }
                                if (status === 'failed' || status === 'error') {
                                    toast.error('Payment failed. Please try again.')
                                }
                            },
                        })
                    } catch (error) {
                        console.error('[gift-purchase] widget error', error)
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
        [dispatch, purchaseGift]
    )

    return {
        buyGift,
        isLoading,
    }
}

export type UseBuyGiftReturn = ReturnType<typeof useBuyGift>
