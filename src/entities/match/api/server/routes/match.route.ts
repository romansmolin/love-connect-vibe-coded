import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { HttpError } from '@/shared/http-client'

import { matchController } from '../controllers/match.controller'

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

    console.error('[match-route] Unexpected error', error)

    return NextResponse.json(
        {
            message: 'Unexpected server error',
        },
        { status: 500 }
    )
}

export const discoverRoute = async (request: NextRequest) => {
    if (request.method !== 'GET') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const response = await matchController.discover(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}

export const actionRoute = async (request: NextRequest) => {
    if (request.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const response = await matchController.action(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}

export const matchesRoute = async (request: NextRequest) => {
    if (request.method !== 'GET') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const response = await matchController.listMatches(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}
