import { NextResponse } from 'next/server'

import { fetchCommunityActivity } from '../server/dashboard.service'

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

    return NextResponse.json({ ok: false, message: 'Unable to load community activity.' }, { status: 502 })
}

export const GET = async (request: Request) => {
    const cookieHeader = request.headers.get('cookie')
    const sessionId = getCookieValue(cookieHeader, SESSION_COOKIE_NAME)

    if (!sessionId) {
        return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const url = new URL(request.url)
    const wallDate = url.searchParams.get('wall_date') ?? undefined

    try {
        const result = await fetchCommunityActivity(sessionId, wallDate)
        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        return handleError(error)
    }
}
