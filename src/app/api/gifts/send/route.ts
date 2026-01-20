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
    const transactionId = body?.transactionId as string | undefined
    const recipientId = body?.recipientId as string | number | undefined

    if (!transactionId || !recipientId) {
        return NextResponse.json({ message: 'transactionId and recipientId are required' }, { status: 400 })
    }

    try {
        const transaction = await giftService.sendGift({
            sessionId,
            senderId,
            transactionId,
            recipientId: String(recipientId),
        })

        return NextResponse.json({
            transactionId: transaction.id,
            status: transaction.status,
        })
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json({ message: error.message }, { status: error.status ?? 400 })
        }
        console.error('[gift-send] error', error)
        return NextResponse.json({ message: 'Failed to send gift' }, { status: 500 })
    }
}
