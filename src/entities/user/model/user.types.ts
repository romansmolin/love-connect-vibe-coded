export type Gender = 'woman' | 'man' | 'non_binary' | 'other'

export type LookingFor = 'women' | 'man' | 'couple'

export interface PublicUser {
    id: string
    username: string
    name?: string
    email?: string
    sessionId?: string
    tokenLogin?: string
}

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

export interface SignInRequest {
    username: string
    password: string
    rememberMe?: boolean
}

export interface AuthResponse {
    ok: true
    user: PublicUser
}

export interface UserInfoResponse {
    ok: true
    user: PublicUser
}

export interface ErrorResponse {
    ok: false
    message: string
    errors?: Record<string, string[]>
}
