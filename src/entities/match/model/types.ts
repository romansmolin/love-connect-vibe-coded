export type MatchGender = 'man' | 'woman' | 'couple'

export const CITY_OPTIONS = [
    'Amsterdam',
    'Berlin',
    'London',
    'Madrid',
    'New York',
    'Paris',
    'Prague',
    'Riga',
    'Rome',
    'Warsaw',
] as const

const normalizeCityInput = (value: string) => value.trim().toLocaleLowerCase().replaceAll(/\s+/g, ' ')

export const normalizeCity = (value: string): (typeof CITY_OPTIONS)[number] | null => {
    const normalized = normalizeCityInput(value)
    if (!normalized) return null

    return CITY_OPTIONS.find((city) => normalizeCityInput(city) === normalized) ?? null
}

const PROFILE_CITY_STORAGE_PREFIX = 'lovebond:profile-city:v1:'

export const assignProfileCity = <T extends { id: number; location?: string }>(profile: T): T => {
    if (typeof window === 'undefined') {
        const hash = Math.abs(profile.id * 2654435761) % CITY_OPTIONS.length
        return { ...profile, location: CITY_OPTIONS[hash] }
    }

    try {
        const storageKey = `${PROFILE_CITY_STORAGE_PREFIX}${profile.id}`
        const storedCity = window.localStorage.getItem(storageKey)
        const normalizedStoredCity = storedCity ? normalizeCity(storedCity) : null

        if (normalizedStoredCity) {
            return { ...profile, location: normalizedStoredCity }
        }

        const hash = Math.abs(profile.id * 2654435761) % CITY_OPTIONS.length
        const assignedCity = CITY_OPTIONS[hash]
        window.localStorage.setItem(storageKey, assignedCity)
        return { ...profile, location: assignedCity }
    } catch {
        const hash = Math.abs(profile.id * 2654435761) % CITY_OPTIONS.length
        return { ...profile, location: CITY_OPTIONS[hash] }
    }
}

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
