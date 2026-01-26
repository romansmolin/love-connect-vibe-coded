import { NextRequest, NextResponse } from 'next/server'

import { creditService } from '@/entities/credit/api/server/credit.service'
import { SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '@/shared/api/fotochat'

export const GET = async (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const userId = request.cookies.get(USER_COOKIE_NAME)?.value

    if (!sessionId || !userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const data = await creditService.getWallet(userId)
    return NextResponse.json(data)
}
