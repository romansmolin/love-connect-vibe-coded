'use client'

import { useCallback } from 'react'

import { toast } from 'sonner'

import { useSendGiftMutation } from '@/entities/gift'

const resolveErrorMessage = (error: unknown) => {
    if (!error || typeof error !== 'object') return 'Unable to send gift.'
    if ('data' in error) {
        const payload = (error as { data?: { message?: string } }).data
        if (payload?.message) return payload.message
    }
    return 'Unable to send gift.'
}

export const useSendGift = () => {
    const [sendGiftMutation, { isLoading }] = useSendGiftMutation()

    const sendGift = useCallback(
        async (params: { transactionId: string; recipientId: string | number; giftName?: string }) => {
            try {
                const response = await sendGiftMutation({
                    transactionId: params.transactionId,
                    recipientId: params.recipientId,
                }).unwrap()
                const name = params.giftName ? ` ${params.giftName}` : ''
                toast.success(`Gift${name} sent successfully.`)
                return response
            } catch (error) {
                const message = resolveErrorMessage(error)
                toast.error(message)
                throw error
            }
        },
        [sendGiftMutation]
    )

    return {
        sendGift,
        isLoading,
    }
}

export type UseSendGiftReturn = ReturnType<typeof useSendGift>
