export type MemberGender = 'man' | 'woman' | 'couple'

export type ActivityAction = 'con' | 'visite' | 'vote' | 'modif' | 'add_tof' | 'birthday' | 'friends'

export interface CommunityActivityItem {
    id: string | number
    username: string
    gender?: MemberGender
    location?: string
    action: ActivityAction
    timestamp?: string
}

export interface CommunityActivityResponse {
    items: CommunityActivityItem[]
}

export interface MemberSummary {
    id: number
    username: string
    gender?: MemberGender
    age?: number
    location?: string
    rating?: number
    visitedAt?: string
}

export interface TopMembersResponse {
    items: MemberSummary[]
    page?: number
    totalPages?: number
}

export interface RecentVisitorsResponse {
    items: MemberSummary[]
    page?: number
    totalPages?: number
}
