import { NextResponse } from 'next/server'

import { signInSchema, signUpSchema } from '../dto/auth.dto'
import { AuthError } from '../errors/auth.errors'
import { signIn, signUp } from '../services/auth.service'

export const TOKEN_COOKIE_NAME = 'token'

const getRequestBody = async (request: Request) => {
    try {
        return await request.json()
    } catch {
        return null
    }
}

const setAuthCookie = (response: NextResponse, token: string, maxAge: number) => {
    response.cookies.set(TOKEN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
    })
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

    if (!body) {
        return NextResponse.json({ ok: false, message: 'Invalid JSON payload.' }, { status: 400 })
    }

    const parsed = signUpSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(formatValidationError(parsed.error), { status: 400 })
    }

    try {
        const result = await signUp(parsed.data)
        const response = NextResponse.json({ ok: true, user: result.user }, { status: 201 })
        setAuthCookie(response, result.token, result.maxAge)
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
        setAuthCookie(response, result.token, result.maxAge)
        return response
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ ok: false, message: error.message }, { status: error.status })
        }

        console.error('Sign-in error:', error)
        return NextResponse.json({ ok: false, message: 'Unable to sign in right now.' }, { status: 500 })
    }
}
