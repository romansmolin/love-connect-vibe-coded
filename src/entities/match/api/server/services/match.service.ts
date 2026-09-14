import { FOTOCHAT_API_KEY } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import type {
    BlockUserResponse,
    DiscoverMatchesResponse,
    MatchActionResponse,
    MatchCandidate,
    MatchGender,
    MatchListResponse,
    ReportUserResponse,
    VotersResponse,
} from '../../../model/types'
import { matchActionRepo } from '../repositories/match-action.repo'
import { matchRepo } from '../repositories/match.repo'
import type { MembreBlock, MembreVoteBlock } from '../repositories/match.repo'

const mapGender = (value?: number): MatchGender | undefined => {
    switch (value) {
        case 1:
            return 'man'
        case 2:
            return 'woman'
        case 3:
            return 'couple'
        default:
            return undefined
    }
}

const pickPhotoUrl = (member: MembreBlock) => {
    const v2 = member.photos_v2?.[0]
    const legacy = member.photos?.[0]

    return (
        v2?.sq_430 ??
        v2?.sq_middle ??
        v2?.sq_small ??
        v2?.normal ??
        legacy?.url_middle ??
        legacy?.url_small ??
        legacy?.url_big
    )
}

const mapMember = (member: MembreBlock): MatchCandidate => ({
    id: member.id ?? 0,
    username: member.pseudo ?? member.prenom ?? 'Member',
    age: member.age,
    gender: mapGender(member.sexe1),
    location: member.zone_name,
    rating: member.moyenne,
    photoCount: member.photo,
    photoUrl: pickPhotoUrl(member),
})

const extractMembers = (payload: Awaited<ReturnType<typeof matchRepo.listMatches>>): MembreBlock[] => {
    if (Array.isArray(payload)) {
        return payload
    }

    if (Array.isArray(payload.tab_profils)) {
        return payload.tab_profils
    }

    if (Array.isArray(payload.result)) {
        return payload.result
    }

    if (payload.result && typeof payload.result === 'object' && Array.isArray(payload.result.tab_profils)) {
        return payload.result.tab_profils
    }

    return []
}

const extractTotal = (payload: Awaited<ReturnType<typeof matchRepo.listMatches>>): number | undefined => {
    if (Array.isArray(payload)) {
        return undefined
    }

    if (typeof payload.nb_total === 'number') {
        return payload.nb_total
    }

    if (payload.result && typeof payload.result === 'object' && !Array.isArray(payload.result)) {
        const total =
            'nb_total' in payload.result && typeof payload.result.nb_total === 'number'
                ? payload.result.nb_total
                : undefined

        if (typeof total === 'number') {
            return total
        }
    }

    return undefined
}

const mapVoter = (member: MembreVoteBlock): MatchCandidate & { vote?: number } => ({
    id: member.id ?? 0,
    username: member.pseudo ?? member.prenom ?? 'Member',
    age: member.age,
    gender: mapGender(member.sexe1),
    location: member.zone_name,
    rating: member.moyenne,
    photoCount: member.photo,
    photoUrl: pickPhotoUrl(member),
    vote: member.vote,
})

export const matchService = {
    async discover(
        sessionId: string,
        params: Record<string, unknown>,
        appUserId?: string
    ): Promise<DiscoverMatchesResponse> {
        const response = await matchRepo.discover(sessionId, params)

        if (response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        const actedIds = appUserId ? new Set(await matchActionRepo.listActedTargetIds(appUserId)) : null

        const items = (response.result ?? [])
            .filter((member) => !actedIds || typeof member.id !== 'number' || !actedIds.has(member.id))
            .map((member) => mapMember(member))

        return {
            items,
            page: typeof params.page === 'number' ? params.page : undefined,
            totalPages: response.nb_pages,
            total: response.total,
        }
    },
    async discoverPool(
        sessionId: string,
        params: Record<string, unknown>,
        excludedIds: Set<number>,
        cityFilter?: string,
        appUserId?: string
    ): Promise<DiscoverMatchesResponse> {
        const members = new Map<number, MembreBlock>()
        const maxPages = 50
        const perPage = 100
        const targetSize = 200
        let totalPages: number | undefined
        const normalizedCity = cityFilter?.trim().toLowerCase()

        if (appUserId) {
            const actedIds = await matchActionRepo.listActedTargetIds(appUserId)
            for (const id of actedIds) excludedIds.add(id)
        }

        const matchesCity = (member: MembreBlock) =>
            !normalizedCity || (member.zone_name ?? '').toLowerCase().includes(normalizedCity)

        for (let page = 0; page < maxPages; page += 1) {
            const response = await matchRepo.discover(sessionId, {
                ...params,
                page,
                pas: perPage,
                searchAction: 'Last',
            })

            if (response.connected === 0) {
                throw new HttpError('Unauthorized', 401)
            }

            totalPages = response.nb_pages
            const pageMembers = response.result ?? []

            for (const member of pageMembers) {
                if (typeof member.id !== 'number' || member.id <= 0 || excludedIds.has(member.id)) continue
                if (!matchesCity(member)) continue
                members.set(member.id, member)
            }

            const reachedTarget = normalizedCity ? members.size >= targetSize : false

            if (
                pageMembers.length === 0 ||
                reachedTarget ||
                (typeof totalPages === 'number' && page + 1 >= totalPages)
            )
                break
        }

        const items = [...members.values()].slice(0, maxPages * perPage).map((member) => mapMember(member))

        return {
            items,
            page: 0,
            totalPages: 1,
            total: items.length,
        }
    },
    async listMatches(sessionId: string): Promise<MatchListResponse> {
        const response = await matchRepo.listMatches(sessionId)

        if (!Array.isArray(response) && response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        const members = extractMembers(response)
        const items = members.map((member) => mapMember(member))

        const total = extractTotal(response) ?? items.length

        return {
            items,
            total,
        }
    },
    async like(sessionId: string, userId: number, appUserId?: string): Promise<MatchActionResponse> {
        const response = await matchRepo.sendAction({
            sessionId,
            apiKey: FOTOCHAT_API_KEY,
            action: 'set_like',
            userId,
        })

        const result = response.result
        const isMatch = result === 'match'

        if (appUserId) {
            await matchActionRepo.recordAction({ userId: appUserId, targetUserId: userId, action: 'LIKE', isMatch })
        }

        return {
            result,
            isMatch,
        }
    },
    async dislike(sessionId: string, userId: number, appUserId?: string): Promise<MatchActionResponse> {
        const response = await matchRepo.sendAction({
            sessionId,
            apiKey: FOTOCHAT_API_KEY,
            action: 'set_dislike',
            userId,
        })

        const result = response.result
        const isMatch = result === 'match'

        if (appUserId) {
            await matchActionRepo.recordAction({
                userId: appUserId,
                targetUserId: userId,
                action: 'DISLIKE',
                isMatch,
            })
        }

        return {
            result,
            isMatch,
        }
    },
    async getVoters(sessionId: string, page?: number): Promise<VotersResponse> {
        const response = await matchRepo.getVoters(sessionId, page)

        if (response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        return {
            items: response.result?.map(mapVoter) ?? [],
            page,
            totalPages: response.nb_pages,
        }
    },
    async blockUser(sessionId: string, targetId: number, action: 'add' | 'del'): Promise<BlockUserResponse> {
        const response = await matchRepo.setIgnore({ sessionId, targetId, action })

        if (response.result === 0 || response.result === '0') {
            throw new HttpError('Unable to update block list.', 400)
        }

        return { success: true }
    },
    async reportUser(
        sessionId: string,
        targetId: number,
        reason: string,
        details?: string
    ): Promise<ReportUserResponse> {
        const response = await matchRepo.reportUser({ sessionId, targetId, reason, details })

        if (response.result === 0 || response.result === '0') {
            throw new HttpError(response.error || 'Unable to submit report.', 400)
        }

        return { success: true }
    },
}
