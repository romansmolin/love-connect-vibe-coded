import { NextRequest, NextResponse } from 'next/server'

import { giftService } from '@/entities/gift/api/server/gift.service'
import { USER_COOKIE_NAME } from '@/shared/api/fotochat'

export const GET = async (request: NextRequest) => {
    const senderId = request.cookies.get(USER_COOKIE_NAME)?.value

    if (!senderId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const inventory = await giftService.listInventory(senderId)
        return NextResponse.json(inventory)
    } catch (error) {
        console.error('[gift-inventory] error', error)
        return NextResponse.json({ message: 'Failed to load gift inventory' }, { status: 500 })
    }
}
