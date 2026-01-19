import type { NextRequest } from 'next/server'

import { SESSION_COOKIE_NAME } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import type { DiscoverMatchesResponse, MatchAction, MatchActionResponse } from '../../../model/types'
import { matchService } from '../services/match.service'

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

const resolveGender = (value: string | null) => {
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

const cleanParams = (params: Record<string, unknown>) =>
    Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    )

export const matchController = {
    async discover(request: NextRequest): Promise<DiscoverMatchesResponse> {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)

        const page = toOptionalNumber(searchParams.get('page'))
        const perPage = toOptionalNumber(searchParams.get('perPage'))
        const ageFrom = toOptionalNumber(searchParams.get('ageFrom'))
        const ageTo = toOptionalNumber(searchParams.get('ageTo'))
        const genderParam = searchParams.get('gender')
        const hasExplicitFilters = Boolean(genderParam || ageFrom || ageTo)

        const params = cleanParams({
            page,
            pas: perPage,
            age_from: ageFrom,
            age_to: ageTo,
            sex: genderParam ? resolveGender(genderParam) : undefined,
            get_picture_430: 1,
            searchAction: hasExplicitFilters ? undefined : 'Last',
        })

        return matchService.discover(sessionId, params)
    },
    async listMatches(request: NextRequest) {
        const sessionId = requireSessionId(request)

        return matchService.listMatches(sessionId)
    },
    async action(request: NextRequest): Promise<MatchActionResponse> {
        const sessionId = requireSessionId(request)
        const body = await request.json().catch(() => null)

        if (!body || typeof body !== 'object') {
            throw new HttpError('Invalid request payload', 400)
        }

        const payload = body as { action?: MatchAction; userId?: number | string }

        if (payload.action !== 'like' && payload.action !== 'dislike') {
            throw new HttpError('Invalid action', 400)
        }

        const userId = typeof payload.userId === 'string' ? Number(payload.userId) : payload.userId

        if (!userId || !Number.isFinite(userId)) {
            throw new HttpError('Invalid userId', 400)
        }

        if (payload.action === 'like') {
            return matchService.like(sessionId, userId)
        }

        return matchService.dislike(sessionId, userId)
    },
}
