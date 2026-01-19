import { FOTOCHAT_API_KEY } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import type {
    DiscoverMatchesResponse,
    MatchActionResponse,
    MatchCandidate,
    MatchGender,
    MatchListResponse,
} from '../../../model/types'
import { matchRepo } from '../repositories/match.repo'
import type { MembreBlock } from '../repositories/match.repo'

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

    return payload.result ?? []
}

export const matchService = {
    async discover(sessionId: string, params: Record<string, unknown>): Promise<DiscoverMatchesResponse> {
        const response = await matchRepo.discover(sessionId, params)

        if (response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        return {
            items: response.result?.map(mapMember) ?? [],
            page: typeof params.page === 'number' ? params.page : undefined,
            totalPages: response.nb_pages,
            total: response.total,
        }
    },
    async listMatches(sessionId: string): Promise<MatchListResponse> {
        const response = await matchRepo.listMatches(sessionId)

        if (!Array.isArray(response) && response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        const members = extractMembers(response)
        const items = members.map(mapMember)

        return {
            items,
            total: items.length,
        }
    },
    async like(sessionId: string, userId: number): Promise<MatchActionResponse> {
        const response = await matchRepo.sendAction({
            sessionId,
            apiKey: FOTOCHAT_API_KEY,
            action: 'set_like',
            userId,
        })

        const result = response.result

        return {
            result,
            isMatch: result === 'match',
        }
    },
    async dislike(sessionId: string, userId: number): Promise<MatchActionResponse> {
        const response = await matchRepo.sendAction({
            sessionId,
            apiKey: FOTOCHAT_API_KEY,
            action: 'set_dislike',
            userId,
        })

        const result = response.result

        return {
            result,
            isMatch: result === 'match',
        }
    },
}
