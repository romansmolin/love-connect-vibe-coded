export type MatchGender = 'man' | 'woman' | 'couple'

export interface MatchCandidate {
    id: number
    username: string
    age?: number
    gender?: MatchGender
    location?: string
    rating?: number
    photoUrl?: string
    photoCount?: number
}

export interface DiscoverMatchesResponse {
    items: MatchCandidate[]
    page?: number
    totalPages?: number
    total?: number
}

export interface MatchListResponse {
    items: MatchCandidate[]
    total: number
}

export type MatchAction = 'like' | 'dislike'

export interface MatchActionRequest {
    userId: number
    action: MatchAction
}

export interface MatchActionResponse {
    result?: string
    isMatch?: boolean
}
