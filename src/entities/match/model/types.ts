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

export interface MatchActionHistoryItem {
    id: string
    targetUserId: number
    username?: string
    photoUrl?: string
    age?: number
    location?: string
    action: MatchAction
    isMatch: boolean
    createdAt: string
}

export interface MatchActionHistoryResponse {
    items: MatchActionHistoryItem[]
    total: number
    page: number
    perPage: number
    totalPages: number
}

export interface MatchActionHistoryQuery {
    page?: number
    perPage?: number
    action?: MatchAction
}

export interface UserProfileResponse {
    id: number
    username: string
    age?: number
    gender?: MatchGender
    location?: string
    rating?: number
    description?: string
    height?: number
    weight?: number
    lastVisit?: string
    photoUrls: string[]
}

export interface VisitorsResponse {
    items: MatchCandidate[]
    page?: number
    totalPages?: number
}

export interface VotersResponse {
    items: (MatchCandidate & { vote?: number })[]
    page?: number
    totalPages?: number
}

export interface BlockUserRequest {
    targetId: number
    action: 'add' | 'del'
    username?: string
    avatarUrl?: string
}

export interface BlockUserResponse {
    success: boolean
}

export interface BlockedUserSummary {
    id: number
    username: string | null
    avatarUrl: string | null
    blockedAt: string
}

export interface BlockedUsersListResponse {
    items: BlockedUserSummary[]
}

export interface ReportUserRequest {
    targetId: number
    reason: string
    code: string
    details?: string
}

export interface ReportUserResponse {
    success: boolean
}

export interface CompatibilityRequest {
    candidateId: number
    candidateUsername: string
    candidateAge?: number
    candidateGender?: MatchGender
    candidateLocation?: string
}

export interface CompatibilityResponse {
    score: number
    summary: string
    reasons: string[]
}
