import { NextResponse } from 'next/server'

import { signInSchema, signUpSchema } from '../dto/auth.dto'
import { AuthError } from '../errors/auth.errors'
import { signIn, signUp } from '../services/auth.service'

export const SESSION_COOKIE_NAME = 'jetset_session_id'
export const USER_ID_COOKIE_NAME = 'jetset_user_id'
export const TOKEN_LOGIN_COOKIE_NAME = 'jetset_token_login'

const getRequestBody = async (request: Request) => {
    try {
        return await request.json()
    } catch {
        return null
    }
}

const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
})

const setSessionCookies = (
    response: NextResponse,
    data: { sessionId: string; userId?: string; tokenLogin?: string; maxAge: number }
) => {
    response.cookies.set(SESSION_COOKIE_NAME, data.sessionId, cookieOptions(data.maxAge))

    if (data.userId) {
        response.cookies.set(USER_ID_COOKIE_NAME, data.userId, cookieOptions(data.maxAge))
    }

    if (data.tokenLogin) {
        response.cookies.set(TOKEN_LOGIN_COOKIE_NAME, data.tokenLogin, cookieOptions(data.maxAge))
    }
}

const formatValidationError = (error: { flatten: () => { fieldErrors: Record<string, string[]> } }) => {
    return {
        ok: false as const,
        message: 'Invalid request payload.',
        errors: error.flatten().fieldErrors,
    }
}

export const signUpHandler = async (request: Request) => {
    const body = await getRequestBody(request)

    if (!body) return NextResponse.json({ ok: false, message: 'Invalid JSON payload.' }, { status: 400 })

    const parsed = signUpSchema.safeParse(body)

    if (!parsed.success) return NextResponse.json(formatValidationError(parsed.error), { status: 400 })

    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined

    try {
        const result = await signUp(parsed.data, { ipAddress })
        const response = NextResponse.json({ ok: true, user: result.user }, { status: 201 })
        setSessionCookies(response, result)
        return response
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ ok: false, message: error.message }, { status: error.status })
        }

        console.error('Sign-up error:', error)
        return NextResponse.json({ ok: false, message: 'Unable to create account right now.' }, { status: 500 })
    }
}

export const signInHandler = async (request: Request) => {
    const body = await getRequestBody(request)

    if (!body) {
        return NextResponse.json({ ok: false, message: 'Invalid JSON payload.' }, { status: 400 })
    }

    const parsed = signInSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(formatValidationError(parsed.error), { status: 400 })
    }

    try {
        const result = await signIn(parsed.data)
        const response = NextResponse.json({ ok: true, user: result.user }, { status: 200 })
        setSessionCookies(response, result)
        return response
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ ok: false, message: error.message }, { status: error.status })
        }

        console.error('Sign-in error:', error)
        return NextResponse.json({ ok: false, message: 'Unable to sign in right now.' }, { status: 500 })
    }
}
