export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { paymentService } from '@/entities/payment/api/server/payment.service'

const FRONTEND_BASE = (
    process.env.FRONTEND_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ''
).replace(/\/$/, '')

const redirectTo = (status: string, token?: string | null) => {
    const destination =
        status === 'SUCCESSFUL' ? 'success' : status === 'PENDING' ? 'pending' : 'failed'
    const params = new URLSearchParams({ status: destination, ...(token ? { token } : {}) })
    const url = `${FRONTEND_BASE}/payments/secure-processor/${destination}?${params.toString()}`
    return NextResponse.redirect(url)
}

export const GET = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const status = searchParams.get('status')
    const uid = searchParams.get('uid')

    try {
        const updated = await paymentService.handleReturn({ token, status, uid })
        return redirectTo(updated.status, updated.token)
    } catch (error) {
        console.error('[secure-processor-return] error', error)
        return redirectTo('FAILED', token ?? undefined)
    }
}
