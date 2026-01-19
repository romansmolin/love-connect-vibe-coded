import { FOTOCHAT_API_KEY, fotochatHttpClient } from '@/shared/api/fotochat'

export type WallAddPhotoBlock = {
    user_id?: number
    pseudo?: string
    nb?: number
    jour?: string
    cherche1?: number
}

export type WallBirthdayBlock = {
    id?: number
    pseudo?: string
    sexe1?: number
    cherche1?: number
}

export type WallChangeBlock = {
    id?: number
    pseudo?: string
    date_modification?: string
    cherche1?: number
}

export type WallFriendsBlock = {
    id1?: number
    pseudo1?: string
    id2?: number
    pseudo2?: string
    date?: string
    sexe1?: number
}

export type WallOnlineBlock = {
    id?: number
    pseudo?: string
    sexe1?: number
    date?: string
    cherche1?: number
}

export type GetActivitiesResponse = {
    wall_addPhoto?: WallAddPhotoBlock
    wall_birthday?: WallBirthdayBlock
    wall_change?: WallChangeBlock
    wall_friends?: WallFriendsBlock
    wall_online?: WallOnlineBlock
}

export type MembreBlock = {
    id?: number
    pseudo?: string
    prenom?: string
    sexe1?: number
    age?: number
    zone_name?: string
    moyenne?: number
}

export type TopMembersResponse = {
    connected?: number
    nb_pages?: number
    result?: MembreBlock[]
}

export type GuestVisitesResponse = {
    connected?: number
    nb_pages?: number
    result?: MembreBlock[]
}

const ACTIVITY_ENDPOINT = '/ajax_api/getActivities'
const TOP_MEMBERS_ENDPOINT = '/index_api/topmembers'
const RECENT_VISITORS_ENDPOINT = '/index_api/guest/get/visites'

export const dashboardRepo = {
    getActivities(sessionId: string) {
        return fotochatHttpClient.get<GetActivitiesResponse>(ACTIVITY_ENDPOINT, {
            params: {
                session_id: sessionId,
                api_key: FOTOCHAT_API_KEY,
            },
        })
    },
    getTopMembers(sessionId: string, params: { sex: number; ageRange: string; page?: number }) {
        return fotochatHttpClient.post<TopMembersResponse>(TOP_MEMBERS_ENDPOINT, undefined, {
            params: {
                session_id: sessionId,
                api_key: FOTOCHAT_API_KEY,
                sex: params.sex,
                age_range: params.ageRange,
                page: params.page,
            },
        })
    },
    getRecentVisitors(sessionId: string, params: { page?: number }) {
        return fotochatHttpClient.post<GuestVisitesResponse>(RECENT_VISITORS_ENDPOINT, undefined, {
            params: {
                session_id: sessionId,
                api_key: FOTOCHAT_API_KEY,
                page: params.page,
            },
        })
    },
}
