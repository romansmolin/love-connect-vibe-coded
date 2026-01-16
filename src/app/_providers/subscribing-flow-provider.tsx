'use client'

import React, { ReactNode, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useGetUserInfoQuery } from '@/entities/user'

export const SubscribingFlowProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter()
    const { data: userInfo } = useGetUserInfoQuery()
    const userId = userInfo?.user?.id

    useEffect(() => {
        if (!userId) return
        if (typeof window === 'undefined') return

        const stripeLink = sessionStorage.getItem('stripeLink')
        if (!stripeLink) return

        try {
            const url = new URL(stripeLink)
            url.searchParams.set('client_reference_id', userId)
            sessionStorage.removeItem('stripeLink')
            router.push(url.toString())
        } catch (error) {
            console.error('Failed to process Stripe link', error)
            sessionStorage.removeItem('stripeLink')
        }
    }, [router, userId])

    return <>{children}</>
}
