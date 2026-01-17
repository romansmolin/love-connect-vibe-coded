import { JetsetRdvError, fetchJetsetRdv } from '@/shared/api/jetsetrdv/fetch-jetsetrdv'

import { SignInInput, SignUpInput } from '../dto/auth.dto'
import { AuthError } from '../errors/auth.errors'

const SESSION_MAX_AGE = 60 * 60 * 24 * 7
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30

type JetsetLoginResponse = {
    connected?: number
    session_id?: string
    token_login?: string
    user_id?: number
    lang_ui?: string
}

type JetsetSubscribeResponse = {
    accepted?: number
    error?: string
    session_id?: string
    user_id?: number
    lang_ui?: string
}

type JetsetProfileResponse = {
    connected?: number
    result?: {
        id?: number
        pseudo?: string
        prenom?: string
        email?: string
    }
}

const mapGenderToSex = (gender: SignUpInput['gender']) => {
    switch (gender) {
        case 'man':
            return 1
        case 'woman':
            return 2
        default:
            return 3
    }
}

const mapLookingForToCherche = (lookingFor: SignUpInput['lookingFor']) => {
    switch (lookingFor) {
        case 'man':
            return 1
        case 'women':
            return 2
        case 'couple':
            return 3
        default:
            return 1
    }
}

const toBirthday = (value: Date) => value.toISOString().slice(0, 10)

const extractJetsetMessage = (error: JetsetRdvError, fallback: string) => {
    const data = error.data

    if (
        typeof error.message === 'string' &&
        error.message.trim().length > 0 &&
        error.message !== 'JetSetRDV request failed.'
    ) {
        return error.message
    }

    if (typeof data === 'string' && data.trim().length > 0) {
        return data
    }

    if (data && typeof data === 'object') {
        const candidate =
            (data as { error?: unknown; message?: unknown }).error ?? (data as { message?: unknown }).message
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
            return candidate
        }
    }

    return fallback
}

const toJetsetError = (error: unknown, fallbackMessage: string) => {
    if (error instanceof JetsetRdvError) {
        return new AuthError(extractJetsetMessage(error, fallbackMessage), error.status)
    }

    return new AuthError(fallbackMessage, 502)
}

export const signIn = async (input: SignInInput) => {
    try {
        const data = await fetchJetsetRdv<JetsetLoginResponse>({
            path: '/index_api/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: {
                login: input.username,
                pass: input.password,
            },
        })

        if (data.connected !== 1 || !data.session_id) {
            throw new AuthError('Invalid username or password.', 401)
        }

        const maxAge = input.rememberMe ? REMEMBER_MAX_AGE : SESSION_MAX_AGE

        return {
            user: {
                id: String(data.user_id ?? data.session_id),
                username: input.username,
                sessionId: data.session_id,
                tokenLogin: data.token_login,
            },
            sessionId: data.session_id,
            userId: data.user_id ? String(data.user_id) : undefined,
            tokenLogin: data.token_login,
            maxAge,
        }
    } catch (error) {
        if (error instanceof AuthError) {
            throw error
        }

        throw toJetsetError(error, 'Unable to sign in right now.')
    }
}

export const signUp = async (input: SignUpInput, context?: { ipAddress?: string }) => {
    try {
        const birthday = toBirthday(input.dateOfBirth)
        const year = input.dateOfBirth.getUTCFullYear()
        const month = input.dateOfBirth.getUTCMonth() + 1
        const day = input.dateOfBirth.getUTCDate()

        const data = await fetchJetsetRdv<JetsetSubscribeResponse>({
            path: '/index_api/subscribe',
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: {
                login: input.username,
                pass: input.password,
                mail: input.email,
                'fast-part': 1,
                sex: mapGenderToSex(input.gender),
                cherche1: mapLookingForToCherche(input.lookingFor),
                birthday_date: birthday,
                year,
                month,
                day,
                ip_adress: context?.ipAddress ?? '127.0.0.1',
                city: 0,
                region: 0,
                countryObj: 0,
                lang_ui: 'en',
            },
        })

        console.debug('Registration Resposne: ', data)

        if (data.accepted !== 1 || !data.session_id) {
            const message = data.error || 'Registration was not accepted.'
            throw new AuthError(message, 400)
        }

        return {
            user: {
                id: String(data.user_id ?? data.session_id),
                username: input.username,
                sessionId: data.session_id,
            },
            sessionId: data.session_id,
            userId: data.user_id ? String(data.user_id) : undefined,
            maxAge: SESSION_MAX_AGE,
        }
    } catch (error) {
        if (error instanceof AuthError) throw error

        console.error('Here is the err: ', error)

        throw toJetsetError(error, 'Unable to create account right now.')
    }
}

export const getCurrentUser = async (sessionId: string, userId?: string) => {
    if (!sessionId) {
        throw new AuthError('Invalid session.', 401)
    }

    try {
        if (!userId) {
            return {
                id: sessionId,
                username: 'member',
                sessionId,
            }
        }

        const data = await fetchJetsetRdv<JetsetProfileResponse>({
            path: '/index_api/user',
            method: 'POST',
            query: {
                session_id: sessionId,
                id: userId,
            },
        })

        if (data.connected !== 1) {
            throw new AuthError('Session expired.', 401)
        }

        const profile = data.result ?? {}
        return {
            id: String(profile.id ?? userId),
            username: profile.pseudo ?? 'member',
            name: profile.prenom ?? profile.pseudo ?? 'Member',
            email: profile.email ?? undefined,
            sessionId,
        }
    } catch (error) {
        if (error instanceof AuthError) {
            throw error
        }

        throw toJetsetError(error, 'Unable to load user.')
    }
}
