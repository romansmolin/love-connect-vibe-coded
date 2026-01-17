import { NextResponse } from 'next/server'

import { AuthError } from '../errors/auth.errors'
import { getCurrentUser } from '../services/auth.service'

import { SESSION_COOKIE_NAME, USER_ID_COOKIE_NAME } from './auth.controller'

const getCookieValue = (cookieHeader: string | null, name: string) => {
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim())
    const match = cookies.find((cookie) => cookie.startsWith(`${name}=`))
    if (!match) return null

    return decodeURIComponent(match.split('=')[1])
}

export const meHandler = async (request: Request) => {
    const cookieHeader = request.headers.get('cookie')
    const sessionId = getCookieValue(cookieHeader, SESSION_COOKIE_NAME)
    const userId = getCookieValue(cookieHeader, USER_ID_COOKIE_NAME)

    if (!sessionId) {
        return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    }

    try {
        const user = await getCurrentUser(sessionId, userId ?? undefined)
        return NextResponse.json({ ok: true, user }, { status: 200 })
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ ok: false, message: error.message }, { status: error.status })
        }

        console.error('Get user info error:', error)
        return NextResponse.json({ ok: false, message: 'Unable to load user.' }, { status: 500 })
    }
}
