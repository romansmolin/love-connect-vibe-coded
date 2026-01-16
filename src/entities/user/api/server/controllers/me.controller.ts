import { NextResponse } from 'next/server'

import { AuthError } from '../errors/auth.errors'
import { getCurrentUser } from '../services/auth.service'
import { TOKEN_COOKIE_NAME } from './auth.controller'

const getCookieValue = (cookieHeader: string | null, name: string) => {
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim())
    const match = cookies.find((cookie) => cookie.startsWith(`${name}=`))
    if (!match) return null

    return decodeURIComponent(match.split('=')[1])
}

export const meHandler = async (request: Request) => {
    const cookieHeader = request.headers.get('cookie')
    const token = getCookieValue(cookieHeader, TOKEN_COOKIE_NAME)

    if (!token) {
        return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    }

    try {
        const user = await getCurrentUser(token)
        return NextResponse.json({ ok: true, user }, { status: 200 })
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ ok: false, message: error.message }, { status: error.status })
        }

        console.error('Get user info error:', error)
        return NextResponse.json({ ok: false, message: 'Unable to load user.' }, { status: 500 })
    }
}
