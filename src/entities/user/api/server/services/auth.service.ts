import { HttpError } from '@/shared/http-client'

import type {
    Gender,
    LookingFor,
    SignInRequest,
    SignInResponse,
    SignUpRequest,
    SignUpResponse,
} from '../../../model/types'
import { FOTOCHAT_API_KEY, fotochatHttpClient } from '../config'

type FotochatSignUpResponse = {
    accepted?: number
    error?: string
    session_id?: string
    user_id?: number
    lang_ui?: string
}

type FotochatSignInResponse = {
    connected?: number
    session_id?: string
    user_id?: number
    token_login?: string
    lang_ui?: string
}

interface SignUpPayload extends SignUpRequest {
    ipAddress?: string
    userAgent?: string
}

interface SignInPayload extends SignInRequest {
    ipAddress?: string
    userAgent?: string
}

const SIGN_UP_ENDPOINT = '/index_api/subscribe'
const SIGN_IN_ENDPOINT = '/index_api/login'

const mapGenderToApi = (gender: Gender): number => {
    switch (gender) {
        case 'man':
            return 1
        case 'woman':
            return 2
        case 'non_binary':
        case 'other':
        default:
            return 3
    }
}

const mapLookingForToApi = (lookingFor: LookingFor): number => {
    switch (lookingFor) {
        case 'man':
            return 1
        case 'women':
            return 2
        case 'couple':
        default:
            return 3
    }
}

const toOptionalNumber = (value: string) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
}

const cleanParams = (params: Record<string, unknown>) =>
    Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    )

export const authService = {
    async signUp(payload: SignUpPayload): Promise<SignUpResponse> {
        const params = cleanParams({
            login: payload.username,
            pass: payload.password,
            mail: payload.email,
            'fast-part': '1',
            sex: mapGenderToApi(payload.gender),
            cherche1: mapLookingForToApi(payload.lookingFor),
            birthday_date: payload.dateOfBirth,
            ip_adress: payload.ipAddress ?? '0.0.0.0',
            city: toOptionalNumber(payload.city),
            region: undefined,
            countryObj: undefined,
            browser: payload.userAgent,
            lang_ui: 'en',
            api_key: FOTOCHAT_API_KEY,
        })

        const response = await fotochatHttpClient.post<FotochatSignUpResponse>(SIGN_UP_ENDPOINT, undefined, {
            params,
        })

        if (response.accepted !== 1 || !response.session_id || !response.user_id) {
            throw new HttpError(response.error ?? 'Registration failed', 400)
        }

        return {
            accepted: true,
            sessionId: response.session_id,
            userId: response.user_id,
            lang: response.lang_ui,
            error: response.error,
        }
    },

    async signIn(payload: SignInPayload): Promise<SignInResponse> {
        const params = cleanParams({
            login: payload.username,
            pass: payload.password,
            rememberme: payload.rememberMe ? '1' : undefined,
            browser: payload.userAgent,
            api_key: FOTOCHAT_API_KEY,
        })

        const response = await fotochatHttpClient.post<FotochatSignInResponse>(SIGN_IN_ENDPOINT, undefined, {
            params,
        })

        if (response.connected !== 1 || !response.session_id || !response.user_id) {
            throw new HttpError('Invalid credentials', 401)
        }

        return {
            connected: true,
            sessionId: response.session_id,
            userId: response.user_id,
            tokenLogin: response.token_login,
            lang: response.lang_ui,
        }
    },
}
