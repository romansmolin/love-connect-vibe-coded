import { NextRequest, NextResponse } from 'next/server'

import { SESSION_COOKIE_NAME } from '@/shared/api/fotochat'

const protectedRoutes = [
    '/dashboard',
    '/dashborad',
    '/settings',
    '/matching',
    '/chat',
    '/matches',
    '/profile',
    '/gifts',
    '/wallet',
    '/who-liked',
    '/analytics',
]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtected) {
        const sessionId = request.cookies.get(SESSION_COOKIE_NAME)

        if (!sessionId) {
            return NextResponse.redirect(new URL('/auth', request.url))
        }
    }

    return NextResponse.next()
}

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
