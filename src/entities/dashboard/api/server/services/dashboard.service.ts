import { HttpError } from '@/shared/http-client'

import type {
    CommunityActivityResponse,
    MemberGender,
    MemberSummary,
    RecentVisitorsResponse,
    TopMembersResponse,
} from '../../../model/types'
import { dashboardRepo } from '../repositories/dashboard.repo'
import type {
    GetActivitiesResponse,
    GuestVisitesResponse,
    MembreBlock,
    TopMembersResponse as ApiTopMembersResponse,
} from '../repositories/dashboard.repo'

const DEFAULT_USERNAME = 'Member'

const mapGender = (value?: number): MemberGender | undefined => {
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

const mapMember = (member: MembreBlock): MemberSummary => ({
    id: member.id ?? 0,
    username: member.pseudo ?? member.prenom ?? DEFAULT_USERNAME,
    gender: mapGender(member.sexe1),
    age: member.age,
    location: member.zone_name,
    rating: member.moyenne,
})

const ensureConnected = (payload: ApiTopMembersResponse | GuestVisitesResponse) => {
    if (payload.connected === 0) {
        throw new HttpError('Unauthorized', 401)
    }
}

const buildActivityItems = (payload: GetActivitiesResponse): CommunityActivityResponse['items'] => {
    const items: CommunityActivityResponse['items'] = []

    if (payload.wall_online?.pseudo) {
        items.push({
            id: payload.wall_online.id ?? `online-${payload.wall_online.pseudo}`,
            username: payload.wall_online.pseudo,
            gender: mapGender(payload.wall_online.sexe1),
            action: 'con',
            timestamp: payload.wall_online.date,
        })
    }

    if (payload.wall_addPhoto?.pseudo) {
        items.push({
            id: payload.wall_addPhoto.user_id ?? `photo-${payload.wall_addPhoto.pseudo}`,
            username: payload.wall_addPhoto.pseudo,
            action: 'add_tof',
            timestamp: payload.wall_addPhoto.jour,
        })
    }

    if (payload.wall_change?.pseudo) {
        items.push({
            id: payload.wall_change.id ?? `change-${payload.wall_change.pseudo}`,
            username: payload.wall_change.pseudo,
            action: 'modif',
            timestamp: payload.wall_change.date_modification,
        })
    }

    if (payload.wall_birthday?.pseudo) {
        items.push({
            id: payload.wall_birthday.id ?? `birthday-${payload.wall_birthday.pseudo}`,
            username: payload.wall_birthday.pseudo,
            gender: mapGender(payload.wall_birthday.sexe1),
            action: 'birthday',
        })
    }

    if (payload.wall_friends?.pseudo1 && payload.wall_friends?.pseudo2) {
        items.push({
            id: `friends-${payload.wall_friends.id1 ?? 0}-${payload.wall_friends.id2 ?? 0}`,
            username: `${payload.wall_friends.pseudo1} & ${payload.wall_friends.pseudo2}`,
            gender: mapGender(payload.wall_friends.sexe1),
            action: 'friends',
            timestamp: payload.wall_friends.date,
        })
    }

    return items
}

export const dashboardService = {
    async getActivities(sessionId: string): Promise<CommunityActivityResponse> {
        const response = await dashboardRepo.getActivities(sessionId)

        return {
            items: buildActivityItems(response),
        }
    },
    async getTopMembers(sessionId: string, params: { sex: number; ageRange: string; page?: number }) {
        const response = await dashboardRepo.getTopMembers(sessionId, params)

        ensureConnected(response)

        return {
            items: response.result?.map(mapMember) ?? [],
            page: params.page ?? 0,
            totalPages: response.nb_pages,
        } satisfies TopMembersResponse
    },
    async getRecentVisitors(sessionId: string, params: { page?: number }) {
        const response = await dashboardRepo.getRecentVisitors(sessionId, params)

        ensureConnected(response)

        return {
            items: response.result?.map(mapMember) ?? [],
            page: params.page ?? 0,
            totalPages: response.nb_pages,
        } satisfies RecentVisitorsResponse
    },
}
