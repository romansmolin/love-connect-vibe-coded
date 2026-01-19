export type Gender = 'woman' | 'man' | 'non_binary' | 'other'

export type LookingFor = 'women' | 'man' | 'couple'

export interface SignUpRequest {
    name: string
    email: string
    password: string
    username: string
    gender: Gender
    lookingFor: LookingFor
    dateOfBirth: string
    city: string
}

export interface SignUpResponse {
    accepted: boolean
    sessionId: string
    userId: number
    lang?: string
    error?: string
}

export interface SignInRequest {
    username: string
    password: string
    rememberMe?: boolean
}

export interface SignInResponse {
    connected: boolean
    sessionId: string
    userId: number
    tokenLogin?: string
    lang?: string
}

export interface UserInfoResponse {
    user: {
        id: string
        username?: string
        email?: string
    }
    sessionId?: string
    lang?: string
}

export type UserGender = 'man' | 'woman' | 'couple'

export interface UserPhoto {
    urlLarge?: string
    urlMedium?: string
    urlSmall?: string
}

export interface UserProfile {
    id: number
    username: string
    fullName?: string
    age?: number
    gender?: UserGender
    location?: string
    email?: string
    lastVisit?: string
    avatarUrl?: string
    photos?: UserPhoto[]
    photoCount?: number
}

export interface UserProfileResponse {
    user: UserProfile
}

export interface UserPreview {
    id: number
    username: string
    age?: number
    location?: string
    avatarUrl?: string
}
