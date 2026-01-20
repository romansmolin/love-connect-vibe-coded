import { NextResponse } from 'next/server'

import { giftService } from '@/entities/gift/api/server/gift.service'

export const GET = async () => {
    try {
        const items = await giftService.listCatalog()
        return NextResponse.json({ items })
    } catch (error) {
        console.error('[gifts-catalog] error', error)
        return NextResponse.json({ message: 'Failed to load catalog' }, { status: 500 })
    }
}
