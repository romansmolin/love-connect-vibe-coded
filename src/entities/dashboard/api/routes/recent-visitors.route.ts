import { NextResponse } from 'next/server'

import { fetchRecentVisitors } from '../server/dashboard.service'

import { SESSION_COOKIE_NAME } from '@/entities/user/api/server/controllers/auth.controller'
import { JetsetRdvError } from '@/shared/api/jetsetrdv/fetch-jetsetrdv'

const getCookieValue = (cookieHeader: string | null, name: string) => {
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim())
    const match = cookies.find((cookie) => cookie.startsWith(`${name}=`))
    if (!match) return null

    return decodeURIComponent(match.split('=')[1])
}

const handleError = (error: unknown) => {
    if (error instanceof JetsetRdvError) {
        return NextResponse.json({ ok: false, message: error.message }, { status: error.status })
    }

    return NextResponse.json({ ok: false, message: 'Unable to load recent visitors.' }, { status: 502 })
}

export const GET = async (request: Request) => {
    const cookieHeader = request.headers.get('cookie')
    const sessionId = getCookieValue(cookieHeader, SESSION_COOKIE_NAME)

    if (!sessionId) {
        return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const url = new URL(request.url)
    const pageParam = url.searchParams.get('page')
    const page = pageParam ? Number(pageParam) || 0 : 0

    try {
        const result = await fetchRecentVisitors(sessionId, page)
        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        return handleError(error)
    }
}
