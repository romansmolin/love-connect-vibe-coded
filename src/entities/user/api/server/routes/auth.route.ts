import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { HttpError } from '@/shared/http-client'

import type { SignInRequest, SignUpRequest } from '../../../model/types'
import { LANG_COOKIE_NAME, SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '../config'
import { authService } from '../services/auth.service'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const getClientIp = (request: NextRequest) => {
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) return forwardedFor.split(',')[0]?.trim()

    return request.headers.get('x-real-ip') ?? '0.0.0.0'
}

const setSessionCookies = (response: NextResponse, sessionId: string, userId: number, lang?: string) => {
    const secure = process.env.NODE_ENV === 'production'

    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: sessionId,
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    })

    response.cookies.set({
        name: USER_COOKIE_NAME,
        value: String(userId),
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    })

    if (lang) {
        response.cookies.set({
            name: LANG_COOKIE_NAME,
            value: lang,
            httpOnly: true,
            sameSite: 'lax',
            secure,
            path: '/',
            maxAge: COOKIE_MAX_AGE,
        })
    }
}

const handleError = (error: unknown) => {
    if (error instanceof HttpError) {
        return NextResponse.json(
            {
                message: error.message,
                data: error.data,
            },
            {
                status: error.status ?? 500,
            }
        )
    }

    console.error('[auth-route] Unexpected error', error)

    return NextResponse.json(
        {
            message: 'Unexpected server error',
        },
        { status: 500 }
    )
}

const isValidSignUpBody = (body: unknown): body is SignUpRequest => {
    if (!body || typeof body !== 'object') return false
    const payload = body as Record<string, unknown>

    return (
        typeof payload.name === 'string' &&
        typeof payload.email === 'string' &&
        typeof payload.password === 'string' &&
        typeof payload.username === 'string' &&
        typeof payload.gender === 'string' &&
        typeof payload.lookingFor === 'string' &&
        typeof payload.dateOfBirth === 'string' &&
        typeof payload.city === 'string'
    )
}

const isValidSignInBody = (body: unknown): body is SignInRequest => {
    if (!body || typeof body !== 'object') return false
    const payload = body as Record<string, unknown>

    return typeof payload.username === 'string' && typeof payload.password === 'string'
}

export const signUpRoute = async (request: NextRequest) => {
    if (request.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const body = await request.json()
        if (!isValidSignUpBody(body)) {
            return NextResponse.json({ message: 'Invalid request payload' }, { status: 400 })
        }
        const userAgent = request.headers.get('user-agent') ?? undefined
        const ipAddress = getClientIp(request)

        const result = await authService.signUp({ ...body, ipAddress, userAgent })

        const response = NextResponse.json({
            accepted: result.accepted,
            sessionId: result.sessionId,
            userId: result.userId,
            lang: result.lang,
        })

        setSessionCookies(response, result.sessionId, result.userId, result.lang)

        return response
    } catch (error) {
        return handleError(error)
    }
}

export const signInRoute = async (request: NextRequest) => {
    if (request.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const body = await request.json()
        if (!isValidSignInBody(body)) {
            return NextResponse.json({ message: 'Invalid request payload' }, { status: 400 })
        }
        const userAgent = request.headers.get('user-agent') ?? undefined
        const ipAddress = getClientIp(request)

        const result = await authService.signIn({ ...body, ipAddress, userAgent })

        const response = NextResponse.json({
            connected: result.connected,
            sessionId: result.sessionId,
            userId: result.userId,
            tokenLogin: result.tokenLogin,
            lang: result.lang,
        })

        setSessionCookies(response, result.sessionId, result.userId, result.lang)

        return response
    } catch (error) {
        return handleError(error)
    }
}

export const meRoute = async () => {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const userId = cookieStore.get(USER_COOKIE_NAME)?.value
    const lang = cookieStore.get(LANG_COOKIE_NAME)?.value

    if (!sessionId || !userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
        user: { id: userId },
        sessionId,
        lang,
    })
}
