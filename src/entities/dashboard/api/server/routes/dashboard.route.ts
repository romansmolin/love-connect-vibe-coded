import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { HttpError } from '@/shared/http-client'

import { dashboardController } from '../controllers/dashboard.controller'

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

    console.error('[dashboard-route] Unexpected error', error)

    return NextResponse.json(
        {
            message: 'Unexpected server error',
        },
        { status: 500 }
    )
}

export const activityRoute = async (request: NextRequest) => {
    if (request.method !== 'GET') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const response = await dashboardController.getActivities(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}

export const topMembersRoute = async (request: NextRequest) => {
    if (request.method !== 'GET') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const response = await dashboardController.getTopMembers(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}

export const recentVisitorsRoute = async (request: NextRequest) => {
    if (request.method !== 'GET') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const response = await dashboardController.getRecentVisitors(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}
