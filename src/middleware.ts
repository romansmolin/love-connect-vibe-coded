import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtected) {
        const token = request.cookies.get('token')

        if (!token) {
            return NextResponse.redirect(new URL('/auth', request.url))
        }
    }

    return NextResponse.next()
}

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
