import { NextRequest, NextResponse } from 'next/server'

import { emailService } from '../services/email.service'

const isEnabled = () => process.env.NODE_ENV !== 'production'

export const testEmailRoute = async (request: NextRequest) => {
    if (!isEnabled()) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const body = (await request.json().catch(() => null)) as { to?: string } | null
    const to = body?.to?.trim()

    if (!to) {
        return NextResponse.json({ message: 'to is required' }, { status: 400 })
    }

    try {
        const sent = await emailService.sendTestEmail(to)
        return NextResponse.json({ success: sent })
    } catch (error) {
        console.error('[email-test] failed', error)
        return NextResponse.json({ message: 'Failed to send test email' }, { status: 500 })
    }
}
