import { JetsetRdvError, fetchJetsetRdv } from '@/shared/api/jetsetrdv/fetch-jetsetrdv'

import { CommunityActivityItem, RecentVisitor, TopMember } from '../../model/dashboard.types'

type WallMember = {
    id?: number
    pseudo?: string
    action?: string
    date_action?: string
    age?: number
    moyenne?: number
    sexe1?: number
    zone_name?: string
}

type ResultWall = {
    connected?: number
    result?: WallMember[]
}

type ResultTopMembers = {
    connected?: number
    nb_pages?: number
    result?: MemberBlock[]
}

type ResultGuestVisites = {
    connected?: number
    nb_pages?: number
    result?: MemberBlock[]
}

type MemberBlock = {
    id?: number
    pseudo?: string
    age?: number
    moyenne?: number
    sexe1?: number
    zone_name?: string
    online?: number
    photo_x?: string
}

const mapGender = (value?: number) => {
    if (value === 1) return 'man'
    if (value === 2) return 'woman'
    if (value === 3) return 'couple'
    return undefined
}

const mapTopMember = (item: MemberBlock): TopMember => ({
    id: String(item.id ?? crypto.randomUUID()),
    username: item.pseudo ?? 'Member',
    age: item.age,
    rating: item.moyenne,
    gender: mapGender(item.sexe1),
    location: item.zone_name,
    isOnline: item.online === 1,
    photoUrl: item.photo_x,
})

const mapActivity = (item: WallMember): CommunityActivityItem => ({
    id: String(item.id ?? crypto.randomUUID()),
    username: item.pseudo ?? 'Member',
    action: item.action ?? 'activity',
    timestamp: item.date_action,
    age: item.age,
    rating: item.moyenne,
    gender: mapGender(item.sexe1),
    location: item.zone_name,
})

const mapVisitor = (item: MemberBlock): RecentVisitor => ({
    id: String(item.id ?? crypto.randomUUID()),
    username: item.pseudo ?? 'Member',
    age: item.age,
    rating: item.moyenne,
    gender: mapGender(item.sexe1),
    location: item.zone_name,
})

export const fetchCommunityActivity = async (sessionId: string, wallDate?: string) => {
    if (!sessionId) {
        throw new JetsetRdvError('Unauthorized', 401)
    }

    try {
        const data = await fetchJetsetRdv<ResultWall>({
            path: '/index_api/wall',
            method: 'POST',
            query: {
                session_id: sessionId,
                wall_date: wallDate,
            },
        })

        if (data.connected === 0) {
            throw new JetsetRdvError('Unauthorized', 401)
        }

        const items = (data.result ?? []).map(mapActivity)
        return { ok: true as const, items }
    } catch (error) {
        if (error instanceof JetsetRdvError) {
            throw error
        }
        throw new JetsetRdvError('Unable to load community activity.', 502)
    }
}

export const fetchTopMembers = async (gender: 'men' | 'women', page = 0) => {
    const sex = gender === 'women' ? 2 : 1

    try {
        const data = await fetchJetsetRdv<ResultTopMembers>({
            path: '/index_api/topmembers',
            method: 'POST',
            query: {
                sex,
                age_range: '18-50',
                page,
            },
        })

        const items = (data.result ?? []).map(mapTopMember)
        return {
            ok: true as const,
            items,
            page,
            pages: data.nb_pages ?? 1,
        }
    } catch (error) {
        if (error instanceof JetsetRdvError) {
            throw error
        }
        throw new JetsetRdvError('Unable to load top members.', 502)
    }
}

export const fetchRecentVisitors = async (sessionId: string, page = 0) => {
    if (!sessionId) {
        throw new JetsetRdvError('Unauthorized', 401)
    }

    try {
        const data = await fetchJetsetRdv<ResultGuestVisites>({
            path: '/index_api/guest/get/visites',
            method: 'POST',
            query: {
                session_id: sessionId,
                page,
            },
        })

        if (data.connected === 0) {
            throw new JetsetRdvError('Unauthorized', 401)
        }

        const items = (data.result ?? []).map(mapVisitor)
        return {
            ok: true as const,
            items,
            page,
            pages: data.nb_pages ?? 1,
        }
    } catch (error) {
        if (error instanceof JetsetRdvError) {
            throw error
        }
        throw new JetsetRdvError('Unable to load recent visitors.', 502)
    }
}
