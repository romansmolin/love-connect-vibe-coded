import { NextRequest, NextResponse } from 'next/server'

import { paymentService } from '@/entities/payment/api/server/payment.service'

export const POST = async (request: NextRequest) => {
    try {
        const signature = request.headers.get('content-signature') ?? undefined
        const buffer = Buffer.from(await request.arrayBuffer())
        await paymentService.processWebhook(buffer, signature)
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[secure-processor-webhook] error', error)
        return NextResponse.json({ message: 'Webhook processing failed' }, { status: 400 })
    }
}
