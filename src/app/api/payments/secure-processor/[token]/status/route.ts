export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/shared/lib/prisma'

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
    const { token } = await context.params

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const record = await prisma.paymentToken.findUnique({ where: { token } })

    if (!record) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
        status: record.status,
        amountCents: record.amountCents,
        currency: record.currency,
        updatedAt: record.updatedAt,
    })
}
