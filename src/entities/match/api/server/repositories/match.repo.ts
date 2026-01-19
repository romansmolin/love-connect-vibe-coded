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

const SEARCH_ENDPOINT = '/index_api/search'
const MATCH_ENDPOINT = '/index_api/match'

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
}
