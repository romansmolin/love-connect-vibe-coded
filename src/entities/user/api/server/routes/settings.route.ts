import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { HttpError } from '@/shared/http-client'

import { LANG_COOKIE_NAME, SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '../config'
import { userController } from '../controllers/user.controller'

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

    console.error('[user-settings-route] Unexpected error', error)

    return NextResponse.json(
        {
            message: 'Unexpected server error',
        },
        { status: 500 }
    )
}

export const logoutRoute = async (request: NextRequest) => {
    if (request.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const result = await userController.logout(request)
        const response = NextResponse.json({ success: true, result: result.result })

        response.cookies.delete(SESSION_COOKIE_NAME)
        response.cookies.delete(USER_COOKIE_NAME)
        response.cookies.delete(LANG_COOKIE_NAME)

        return response
    } catch (error) {
        return handleError(error)
    }
}

export const deleteAccountRoute = async (request: NextRequest) => {
    if (request.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const result = await userController.deleteAccount(request)
        const response = NextResponse.json({
            success: true,
            message: result.result || 'Account deleted',
        })

        response.cookies.delete(SESSION_COOKIE_NAME)
        response.cookies.delete(USER_COOKIE_NAME)
        response.cookies.delete(LANG_COOKIE_NAME)

        return response
    } catch (error) {
        return handleError(error)
    }
}

export const lostPassRoute = async (request: NextRequest) => {
    if (request.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const result = await userController.requestPasswordReset(request)
        return NextResponse.json(result)
    } catch (error) {
        return handleError(error)
    }
}
