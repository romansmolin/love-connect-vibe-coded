import type { NextRequest } from 'next/server'

import { appUserRepo } from '@/entities/demo-activity/api/server/repositories/app-user.repo'
import { SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import type {
    BlockUserResponse,
    DiscoverMatchesResponse,
    MatchAction,
    MatchActionResponse,
    ReportUserResponse,
    VotersResponse,
} from '../../../model/types'
import { matchService } from '../services/match.service'

const requireSessionId = (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!sessionId) {
        throw new HttpError('Unauthorized', 401)
    }

    return sessionId
}

const getAppUserId = (request: NextRequest) => request.cookies.get(USER_COOKIE_NAME)?.value

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
        const cityParam = searchParams.get('city')?.trim() || undefined
        const isPoolRequest = searchParams.get('pool') === '1'
        const excludedIds = new Set(
            (searchParams.get('excludeIds') ?? '')
                .split(',')
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value > 0)
        )
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

        const appUserId = getAppUserId(request)

        if (appUserId) {
            await appUserRepo.touch(appUserId)
        }

        return isPoolRequest
            ? matchService.discoverPool(sessionId, params, excludedIds, cityParam, appUserId)
            : matchService.discover(sessionId, params, appUserId)
    },
    async listMatches(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const appUserId = getAppUserId(request)

        return matchService.listMatches(sessionId, appUserId)
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

        const appUserId = getAppUserId(request)

        if (payload.action === 'like') {
            return matchService.like(sessionId, userId, appUserId)
        }

        return matchService.dislike(sessionId, userId, appUserId)
    },
    async getVoters(request: NextRequest): Promise<VotersResponse> {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)
        const page = toOptionalNumber(searchParams.get('page'))
        const appUserId = getAppUserId(request)

        return matchService.getVoters(sessionId, page, appUserId)
    },
    async blockUser(request: NextRequest): Promise<BlockUserResponse> {
        const sessionId = requireSessionId(request)
        const body = await request.json().catch(() => null)

        if (!body || typeof body !== 'object') {
            throw new HttpError('Invalid request payload', 400)
        }

        const payload = body as { targetId?: number | string; action?: string }
        const targetId = typeof payload.targetId === 'string' ? Number(payload.targetId) : payload.targetId
        const action = payload.action

        if (!targetId || !Number.isFinite(targetId) || targetId <= 0) {
            throw new HttpError('Invalid targetId', 400)
        }

        if (action !== 'add' && action !== 'del') {
            throw new HttpError('Invalid action', 400)
        }

        return matchService.blockUser(sessionId, targetId, action, getAppUserId(request))
    },
    async reportUser(request: NextRequest): Promise<ReportUserResponse> {
        const sessionId = requireSessionId(request)
        const body = await request.json().catch(() => null)

        if (!body || typeof body !== 'object') {
            throw new HttpError('Invalid request payload', 400)
        }

        const payload = body as { targetId?: number | string; reason?: string; details?: string; code?: string }
        const targetId = typeof payload.targetId === 'string' ? Number(payload.targetId) : payload.targetId

        if (!targetId || !Number.isFinite(targetId) || targetId <= 0) {
            throw new HttpError('Invalid targetId', 400)
        }

        if (!payload.reason || typeof payload.reason !== 'string') {
            throw new HttpError('Reason is required', 400)
        }

        if (!payload.code || typeof payload.code !== 'string') {
            throw new HttpError('Security code is required', 400)
        }

        return matchService.reportUser(
            sessionId,
            targetId,
            payload.reason,
            payload.code,
            payload.details,
            getAppUserId(request)
        )
    },
    async getCaptcha(request: NextRequest): Promise<ArrayBuffer> {
        const sessionId = requireSessionId(request)

        return matchService.getCaptcha(sessionId)
    },
}
