import type { NextRequest } from 'next/server'

import { HttpError } from '@/shared/http-client'
import { SESSION_COOKIE_NAME } from '@/shared/api/fotochat'

import { dashboardService } from '../services/dashboard.service'

const DEFAULT_AGE_RANGE = '18-99'

const requireSessionId = (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!sessionId) {
        throw new HttpError('Unauthorized', 401)
    }

    return sessionId
}

const toOptionalNumber = (value: string | null) => {
    if (value === null) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
}

const resolveGenderFilter = (value: string | null) => {
    switch (value) {
        case 'women':
        case 'woman':
            return 2
        case 'couple':
            return 3
        case 'men':
        case 'man':
        default:
            return 1
    }
}

export const dashboardController = {
    async getActivities(request: NextRequest) {
        const sessionId = requireSessionId(request)

        return dashboardService.getActivities(sessionId)
    },
    async getTopMembers(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)
        const sex = resolveGenderFilter(searchParams.get('gender'))
        const ageRange = searchParams.get('ageRange') ?? searchParams.get('age_range') ?? DEFAULT_AGE_RANGE
        const page = toOptionalNumber(searchParams.get('page'))

        return dashboardService.getTopMembers(sessionId, {
            sex,
            ageRange,
            page,
        })
    },
    async getRecentVisitors(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)
        const page = toOptionalNumber(searchParams.get('page'))

        return dashboardService.getRecentVisitors(sessionId, {
            page,
        })
    },
}
