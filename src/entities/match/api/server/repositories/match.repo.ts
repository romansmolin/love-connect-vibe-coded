import { FOTOCHAT_API_KEY, fotochatHttpClient } from '@/shared/api/fotochat'

export type PhotoBlock = {
    url_middle?: string
    url_small?: string
    url_big?: string
}

export type PhotoBlockV2 = {
    normal?: string
    sq_430?: string
    sq_middle?: string
    sq_small?: string
}

export type MembreBlock = {
    id?: number
    pseudo?: string
    prenom?: string
    sexe1?: number
    age?: number
    zone_name?: string
    moyenne?: number
    photo?: number
    photos?: PhotoBlock[]
    photos_v2?: PhotoBlockV2[]
}

export type SearchResponse = {
    connected?: number
    nb_pages?: number
    total?: number
    result?: MembreBlock[]
}

export type MatchListApiResponse =
    | {
          connected?: number
          result?: MembreBlock[] | { nb_total?: number; tab_profils?: MembreBlock[] }
          tab_profils?: MembreBlock[]
          nb_total?: number
      }
    | MembreBlock[]

export type MatchActionApiResponse = {
    result?: string
}

export type MembreVoteBlock = {
    id?: number
    pseudo?: string
    prenom?: string
    sexe1?: number
    age?: number
    zone_name?: string
    moyenne?: number
    photo?: number
    vote?: number
    photos?: PhotoBlock[]
    photos_v2?: PhotoBlockV2[]
}

export type VotersApiResponse = {
    connected?: number
    nb_pages?: number
    result?: MembreVoteBlock[]
}

export type SetIgnoreResponse = {
    result?: number | string
}

export type ReportUserResponse = {
    result?: number | string
    error?: string
}

const SEARCH_ENDPOINT = '/index_api/search'
const MATCH_ENDPOINT = '/index_api/match'
const VOTERS_ENDPOINT = '/index_api/guest/get/votes'
const SET_IGNORE_ENDPOINT = '/ajax_api/setIgnore'
const IS_SUSPECT_ENDPOINT = '/index_api/user/is_suspect'
const CAPTCHA_ENDPOINT = '/index_api/captcha'

export const matchRepo = {
    discover(sessionId: string, params: Record<string, unknown>) {
        return fotochatHttpClient.post<SearchResponse>(SEARCH_ENDPOINT, undefined, {
            params: {
                session_id: sessionId,
                api_key: FOTOCHAT_API_KEY,
                ...params,
            },
        })
    },
    listMatches(sessionId: string) {
        return fotochatHttpClient.get<MatchListApiResponse>(MATCH_ENDPOINT, {
            params: {
                session_id: sessionId,
                api_key: FOTOCHAT_API_KEY,
                action: 'get_matches',
            },
        })
    },
    sendAction(params: { sessionId: string; apiKey: string; action: 'set_like' | 'set_dislike'; userId: number }) {
        return fotochatHttpClient.get<MatchActionApiResponse>(MATCH_ENDPOINT, {
            params: {
                session_id: params.sessionId,
                api_key: params.apiKey,
                action: params.action,
                id_user: params.userId,
            },
        })
    },
    getVoters(sessionId: string, page?: number) {
        return fotochatHttpClient.post<VotersApiResponse>(VOTERS_ENDPOINT, undefined, {
            params: {
                session_id: sessionId,
                api_key: FOTOCHAT_API_KEY,
                get_picture_430: 1,
                page,
            },
        })
    },
    setIgnore(params: { sessionId: string; targetId: number; action: 'add' | 'del' }) {
        return fotochatHttpClient.get<SetIgnoreResponse>(SET_IGNORE_ENDPOINT, {
            params: {
                session_id: params.sessionId,
                api_key: FOTOCHAT_API_KEY,
                action: params.action,
                target_id: params.targetId,
            },
        })
    },
    reportUser(params: { sessionId: string; targetId: number; reason: string; details?: string; code: string }) {
        return fotochatHttpClient.post<ReportUserResponse>(IS_SUSPECT_ENDPOINT, undefined, {
            params: {
                session_id: params.sessionId,
                api_key: FOTOCHAT_API_KEY,
                id: params.targetId,
                raison: params.reason,
                details: params.details,
                code: params.code,
            },
        })
    },
    getCaptcha(sessionId: string) {
        return fotochatHttpClient.get<ArrayBuffer>(CAPTCHA_ENDPOINT, {
            params: {
                session_id: sessionId,
                api_key: FOTOCHAT_API_KEY,
            },
            responseType: 'arraybuffer',
        })
    },
}
