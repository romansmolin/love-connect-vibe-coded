import { NextRequest, NextResponse } from 'next/server'

import { paymentService } from '@/entities/payment/api/server/payment.service'

export const GET = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const status = searchParams.get('status')
    const uid = searchParams.get('uid')

    try {
        const updated = await paymentService.handleReturn({ token, status, uid })
        return NextResponse.json({ status: updated.status, token: updated.token })
    } catch (error) {
        console.error('[secure-processor-return] error', error)
        return NextResponse.json({ message: 'Failed to process return' }, { status: 400 })
    }
}
