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
    sexe2?: number
    cherche1?: number
    zone_name?: string
    email?: string
    visite?: string
    photo?: number
    taille?: number
    poids?: number
    yeux?: number
    cheveux?: number
    situation?: number
    silhouette?: number
    personnalite?: number
    horaires?: number
    child?: number
    etudes?: number
    travail?: number
    photos?: PhotoBlock[]
    photos_v2?: PhotoBlockV2[]
    description?: string
}

export type UserProfileResponse = {
    connected?: number
    result?: ProfileBlock
}

export type LogoutResponse = {
    connected?: number
    result?: string
}

export type LostPassResponse = {
    connected?: number
    result?: string
    error?: number
}

export type DeleteAccountResponse = {
    result?: string
    error?: number
}

const USER_PROFILE_ENDPOINT = '/index_api/user'
const UPDATE_INFORMATION_ENDPOINT = '/index_api/user/modify/informations'
const UPDATE_DESCRIPTION_ENDPOINT = '/index_api/user/modify/description'
const LOGOUT_ENDPOINT = '/index_api/logout'
const LOST_PASS_ENDPOINT = '/index_api/lostpass'
const DELETE_ACCOUNT_ENDPOINT = '/index_api/delete'

export type UpdateInformationsParams = {
    sessionId: string
    fullName: string
    bodyOptions?: number[]
    height?: number
    weight?: number
    eyeColor?: number
    hairColor?: number
    situation?: number
    silhouette?: number
    personality?: number
    schedule?: number
    orientation?: number
    children?: number
    education?: number
    profession?: number
    email?: string
    langUi?: string
}

export type UpdateProfileResponse = {
    accepted?: number
    error?: string
}

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
    updateInformations(params: UpdateInformationsParams) {
        return fotochatHttpClient.post<UpdateProfileResponse>(UPDATE_INFORMATION_ENDPOINT, undefined, {
            params: {
                session_id: params.sessionId,
                api_key: FOTOCHAT_API_KEY,
                nom_complet: params.fullName,
                taille: params.height,
                poids: params.weight,
                yeux: params.eyeColor,
                cheveux: params.hairColor,
                situation: params.situation,
                silhouette: params.silhouette,
                personnalite: params.personality,
                horaires: params.schedule,
                sexe2: params.orientation,
                child: params.children,
                etudes: params.education,
                travail: params.profession,
                email: params.email,
                lang_ui: params.langUi,
                'opts_body[]': params.bodyOptions,
            },
        })
    },
    updateDescription(params: { sessionId: string; description: string }) {
        return fotochatHttpClient.post<UpdateProfileResponse>(UPDATE_DESCRIPTION_ENDPOINT, undefined, {
            params: {
                session_id: params.sessionId,
                api_key: FOTOCHAT_API_KEY,
                description: params.description,
            },
        })
    },
    logout(sessionId: string) {
        return fotochatHttpClient.post<LogoutResponse>(LOGOUT_ENDPOINT, undefined, {
            params: {
                session_id: sessionId,
                api_key: FOTOCHAT_API_KEY,
            },
        })
    },
    requestPasswordReset(emailOrUsername: string) {
        return fotochatHttpClient.post<LostPassResponse>(LOST_PASS_ENDPOINT, undefined, {
            params: {
                email_pseudo: emailOrUsername,
                api_key: FOTOCHAT_API_KEY,
            },
        })
    },
    deleteAccount(params: { sessionId: string; password?: string }) {
        return fotochatHttpClient.post<DeleteAccountResponse>(DELETE_ACCOUNT_ENDPOINT, undefined, {
            params: {
                session_id: params.sessionId,
                api_key: FOTOCHAT_API_KEY,
                ActionDelete: 1,
                pass: params.password,
            },
        })
    },
}
