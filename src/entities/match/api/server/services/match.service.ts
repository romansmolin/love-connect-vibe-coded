import { personaMatchService } from '@/entities/demo-activity/api/server/services/persona-match.service'
import { userService } from '@/entities/user/api/server/services/user.service'
import { FOTOCHAT_API_KEY } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import type {
    BlockUserResponse,
    DiscoverMatchesResponse,
    MatchActionHistoryResponse,
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

const toNumber = (value: unknown): number | undefined => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : undefined
    }
    return undefined
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
    id: toNumber(member.id) ?? 0,
    username: member.pseudo ?? member.prenom ?? 'Member',
    age: toNumber(member.age),
    gender: mapGender(member.sexe1),
    location: member.zone_name,
    rating: member.moyenne,
    photoCount: member.photo,
    photoUrl: pickPhotoUrl(member),
})

const mapPendingLike = async (
    sessionId: string,
    row: Awaited<ReturnType<typeof matchActionRepo.listPendingLikes>>[number]
): Promise<MatchActionHistoryResponse['items'][number]> => {
    try {
        const profile = await userService.getMemberProfile({ sessionId, userId: row.targetUserId })

        return {
            id: row.id,
            targetUserId: row.targetUserId,
            username: profile.username,
            photoUrl: profile.avatarUrl,
            age: profile.age,
            location: profile.location,
            action: 'like',
            isMatch: false,
            createdAt: row.createdAt.toISOString(),
        }
    } catch {
        return {
            id: row.id,
            targetUserId: row.targetUserId,
            action: 'like',
            isMatch: false,
            createdAt: row.createdAt.toISOString(),
        }
    }
}

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
    id: toNumber(member.id) ?? 0,
    username: member.pseudo ?? member.prenom ?? 'Member',
    age: toNumber(member.age),
    gender: mapGender(member.sexe1),
    location: member.zone_name,
    rating: member.moyenne,
    photoCount: member.photo,
    photoUrl: pickPhotoUrl(member),
    vote: member.vote,
})

/**
 * Demo-activity is strictly additive: a failure in the simulated path must never take down the
 * real fotochat response it is merged into.
 */
const withoutSimulated = async <T>(label: string, load: () => Promise<T>, fallback: T): Promise<T> => {
    try {
        return await load()
    } catch (error) {
        console.error(`[demo-activity] ${label} failed, serving real data only`, error)
        return fallback
    }
}

/**
 * Simulated personas carry REAL fotochat ids. Any mutation aimed at one must stop here and never
 * reach `matchRepo` — otherwise the demo would like/dislike/block/report a real stranger's account.
 */
const findLinkedPersona = async (appUserId: string | undefined, targetId: number) => {
    if (!appUserId) return null

    return personaMatchService.findLinkedPersona(appUserId, targetId)
}

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
            .filter((member) => !actedIds || !actedIds.has(Number(member.id)))
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
        appUserId?: string,
        maxPages = 50
    ): Promise<DiscoverMatchesResponse> {
        const members = new Map<number, MembreBlock>()
        const perPage = 100
        let totalPages: number | undefined
        const normalizedCity = cityFilter?.trim().toLowerCase()
        const targetSize = normalizedCity ? 5000 : 200

        if (appUserId) {
            const actedIds = await matchActionRepo.listActedTargetIds(appUserId)
            for (const id of actedIds) excludedIds.add(id)
        }

        for (let page = 0; page < maxPages; page += 1) {
            const response = await matchRepo.discover(sessionId, {
                ...params,
                page,
                pas: perPage,
                searchAction: params.searchAction,
            })

            if (response.connected === 0) {
                throw new HttpError('Unauthorized', 401)
            }

            totalPages = response.nb_pages
            const pageMembers = response.result ?? []

            for (const member of pageMembers) {
                const memberId = Number(member.id)
                if (!Number.isInteger(memberId) || memberId <= 0 || excludedIds.has(memberId)) continue
                members.set(memberId, member)
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
    async listMatches(sessionId: string, appUserId?: string): Promise<MatchListResponse> {
        const response = await matchRepo.listMatches(sessionId)

        if (!Array.isArray(response) && response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        const members = extractMembers(response)
        const realItems = members.map((member) => mapMember(member))
        const simulatedItems = appUserId
            ? await withoutSimulated(
                  'listSimulatedMutualMatches',
                  () => personaMatchService.listSimulatedMutualMatches(appUserId),
                  [] as MatchCandidate[]
              )
            : []

        const total = (extractTotal(response) ?? realItems.length) + simulatedItems.length

        return {
            items: [...simulatedItems, ...realItems],
            total,
        }
    },
    async listPendingLikes(sessionId: string, appUserId?: string): Promise<MatchActionHistoryResponse> {
        if (!appUserId) {
            return { items: [], total: 0, page: 1, perPage: 0, totalPages: 0 }
        }

        const rows = await matchActionRepo.listPendingLikes(appUserId)
        const items = await Promise.all(rows.map((row) => mapPendingLike(sessionId, row)))

        return {
            items,
            total: items.length,
            page: 1,
            perPage: items.length,
            totalPages: items.length > 0 ? 1 : 0,
        }
    },
    async like(sessionId: string, userId: number, appUserId?: string): Promise<MatchActionResponse> {
        const persona = await findLinkedPersona(appUserId, userId)

        if (persona && appUserId) {
            await personaMatchService.likeBackPersona(appUserId, persona.id)
            return { result: 'match', isMatch: true }
        }

        const response = await matchRepo.sendAction({
            sessionId,
            apiKey: FOTOCHAT_API_KEY,
            action: 'set_like',
            userId,
        })

        const result = response.result
        const isMatch = result === 'match'

        if (appUserId) {
            await matchActionRepo.recordAction({
                userId: appUserId,
                targetUserId: userId,
                action: 'LIKE',
                isMatch,
            })
        }

        return {
            result,
            isMatch,
        }
    },
    async dislike(sessionId: string, userId: number, appUserId?: string): Promise<MatchActionResponse> {
        const persona = await findLinkedPersona(appUserId, userId)

        if (persona && appUserId) {
            await personaMatchService.unlinkPersona(appUserId, persona.id)
            return { result: 'ok', isMatch: false }
        }

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
    async getVoters(sessionId: string, page?: number, appUserId?: string): Promise<VotersResponse> {
        const response = await matchRepo.getVoters(sessionId, page)

        if (response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        const realItems = response.result?.map(mapVoter) ?? []
        // Simulated likes are a fixed, unpaginated set — merging them into every page would repeat
        // them, so they only ride along with the first (implicit) page.
        const simulatedItems =
            appUserId && !page
                ? await withoutSimulated(
                      'listSimulatedLikes',
                      () => personaMatchService.listSimulatedLikes(appUserId),
                      [] as (MatchCandidate & { vote?: number })[]
                  )
                : []

        return {
            items: [...simulatedItems, ...realItems],
            page,
            totalPages: response.nb_pages,
        }
    },
    async blockUser(
        sessionId: string,
        targetId: number,
        action: 'add' | 'del',
        appUserId?: string
    ): Promise<BlockUserResponse> {
        const persona = await findLinkedPersona(appUserId, targetId)

        if (persona && appUserId) {
            if (action === 'add') {
                await personaMatchService.unlinkPersona(appUserId, persona.id)
            }
            return { success: true }
        }

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
        code: string,
        details?: string,
        appUserId?: string
    ): Promise<ReportUserResponse> {
        const persona = await findLinkedPersona(appUserId, targetId)

        if (persona) {
            return { success: true }
        }

        const response = await matchRepo.reportUser({ sessionId, targetId, reason, details, code })

        if (response.result === 0 || response.result === '0') {
            throw new HttpError(response.error || 'Unable to submit report.', 400)
        }

        return { success: true }
    },
    async getCaptcha(sessionId: string): Promise<ArrayBuffer> {
        return matchRepo.getCaptcha(sessionId)
    },
}
