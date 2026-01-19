import { FOTOCHAT_API_KEY, fotochatHttpClient } from '../config'

export type PhotoBlock = {
    num?: number
    is_main?: number
    is_private?: number
    date?: string
    name?: string
    url_big?: string
    url_middle?: string
    url_small?: string
}

export type PhotoBlockV2 = {
    num?: number
    is_main?: number
    normal?: string
    sq_430?: string
    sq_middle?: string
    sq_small?: string
}

export type ProfileBlock = {
    id?: number
    pseudo?: string
    nom_complet?: string
    prenom?: string
    age?: number
    sexe1?: number
    cherche1?: number
    zone_name?: string
    email?: string
    visite?: string
    photo?: number
    photos?: PhotoBlock[]
    photos_v2?: PhotoBlockV2[]
    description?: string
}

export type UserProfileResponse = {
    connected?: number
    result?: ProfileBlock
}

const USER_PROFILE_ENDPOINT = '/index_api/user'

export const userRepo = {
    getProfile(params: { sessionId: string; userId: number; withPhotos?: boolean }) {
        return fotochatHttpClient.post<UserProfileResponse>(USER_PROFILE_ENDPOINT, undefined, {
            params: {
                session_id: params.sessionId,
                api_key: FOTOCHAT_API_KEY,
                id: params.userId,
                get_picture_430: params.withPhotos ? 1 : undefined,
            },
        })
    },
}
