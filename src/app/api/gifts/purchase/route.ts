import { NextRequest, NextResponse } from 'next/server'

import { giftService } from '@/entities/gift/api/server/gift.service'
import { SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

export const POST = async (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const senderId = request.cookies.get(USER_COOKIE_NAME)?.value

    if (!sessionId || !senderId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const giftId = body?.giftId as string | undefined
    const paymentMode = body?.paymentMode as 'credits' | 'payment' | undefined

    console.log('[gift-purchase] request', {
        hasSession: Boolean(sessionId),
        senderId,
        giftId,
    })

    if (!giftId) {
        return NextResponse.json({ message: 'giftId is required' }, { status: 400 })
    }

    try {
        const result = await giftService.createPurchase({
            senderId,
            giftId,
            paymentMode,
        })

        return NextResponse.json({
            transactionId: result.transaction.id,
            paymentToken: result.paymentToken.token,
            checkoutToken: result.checkout.token,
            status: result.transaction.status,
            paymentMode: result.paymentMode,
            creditsSpent: 'creditsSpent' in result ? result.creditsSpent : undefined,
            walletBalance: 'walletBalance' in result ? result.walletBalance : undefined,
        })
    } catch (error) {
        if (error instanceof HttpError) {
            console.error('[gift-purchase] http error', { message: error.message, status: error.status })
            return NextResponse.json({ message: error.message }, { status: error.status ?? 400 })
        }
        console.error('[gift-purchase] error', error)
        return NextResponse.json({ message: 'Failed to create gift purchase' }, { status: 500 })
    }
}
