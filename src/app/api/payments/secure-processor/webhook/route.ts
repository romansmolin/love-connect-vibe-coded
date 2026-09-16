export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { paymentService } from '@/entities/payment/api/server/payment.service'

export const POST = async (request: NextRequest) => {
    try {
        const authorization =
            request.headers.get('Authorization') ?? request.headers.get('authorization')
        const contentSignature =
            request.headers.get('Content-Signature') ?? request.headers.get('content-signature')
        const buffer = Buffer.from(await request.arrayBuffer())
        await paymentService.processWebhook(buffer, { authorization, contentSignature })
        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('[secure-processor-webhook] error', error)
        return NextResponse.json({ message: 'Webhook processing failed' }, { status: 401 })
    }
}
