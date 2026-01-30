import { NextRequest, NextResponse } from 'next/server'

import { emailService } from '../services/email.service'

const htmlResponse = (body: string, status = 200) =>
    new NextResponse(body, {
        status,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })

export const verifyEmailRoute = async (request: NextRequest) => {
    const token = request.nextUrl.searchParams.get('token')?.trim()

    if (!token) {
        return htmlResponse('<h1>Verification failed</h1><p>Missing token.</p>', 400)
    }

    const result = await emailService.verifyEmailToken(token)
    if (!result.ok) {
        return htmlResponse('<h1>Verification failed</h1><p>Invalid or expired link.</p>', 400)
    }

    return htmlResponse('<h1>Email verified</h1><p>Your email is confirmed. You can close this tab.</p>')
}
