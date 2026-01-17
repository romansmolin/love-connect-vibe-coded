export type GenderLabel = 'man' | 'woman' | 'couple'

export type CommunityActivityItem = {
    id: string
    username: string
    action: string
    timestamp?: string
    age?: number
    location?: string
    gender?: GenderLabel
    rating?: number
}

export type TopMember = {
    id: string
    username: string
    age?: number
    rating?: number
    location?: string
    gender?: GenderLabel
    isOnline?: boolean
    photoUrl?: string
}

export type RecentVisitor = {
    id: string
    username: string
    age?: number
    visitedAt?: string
    location?: string
    gender?: GenderLabel
    rating?: number
}

export type CommunityActivityResponse = {
    ok: true
    items: CommunityActivityItem[]
}

export type TopMembersResponse = {
    ok: true
    items: TopMember[]
    page: number
    pages: number
}

export type RecentVisitorsResponse = {
    ok: true
    items: RecentVisitor[]
    page: number
    pages: number
}
