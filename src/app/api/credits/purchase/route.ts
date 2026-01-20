import { NextRequest, NextResponse } from 'next/server'

import { creditService } from '@/entities/credit/api/server/credit.service'
import { SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

export const POST = async (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const userId = request.cookies.get(USER_COOKIE_NAME)?.value

    if (!sessionId || !userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const credits = Number(body?.credits ?? 0)

    if (!Number.isInteger(credits) || credits <= 0) {
        return NextResponse.json({ message: 'credits is required' }, { status: 400 })
    }

    console.log('[credit-purchase] request', {
        hasSession: Boolean(sessionId),
        userId,
        credits,
    })

    try {
        const result = await creditService.createPurchase({
            userId,
            credits,
        })

        return NextResponse.json({
            transactionId: result.transaction.id,
            paymentToken: result.paymentToken.token,
            checkoutToken: result.checkout.token,
            status: result.transaction.status,
            credits: result.transaction.credits,
            amountCents: result.transaction.amountCents,
            currency: result.transaction.currency,
        })
    } catch (error) {
        if (error instanceof HttpError) {
            console.error('[credit-purchase] http error', { message: error.message, status: error.status })
            return NextResponse.json({ message: error.message }, { status: error.status ?? 400 })
        }
        console.error('[credit-purchase] error', error)
        return NextResponse.json({ message: 'Failed to create credit purchase' }, { status: 500 })
    }
}
