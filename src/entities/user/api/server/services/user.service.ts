import { HttpError } from '@/shared/http-client'

import type { UserGender, UserProfile } from '../../../model/types'
import { userRepo } from '../repositories/user.repo'
import type {
    DeleteAccountResponse,
    LogoutResponse,
    LostPassResponse,
    PhotoBlock,
    PhotoBlockV2,
    ProfileBlock,
    UpdateInformationsParams,
    UpdateProfileResponse,
} from '../repositories/user.repo'

const mapGender = (value?: number): UserGender | undefined => {
    switch (value) {
        case 1:
            return 'man'
        case 2:
            return 'woman'
        case 3:
            return 'couple'
        default:
            return undefined
    }
}

const mapPhoto = (photo: PhotoBlock) => ({
    urlLarge: photo.url_big,
    urlMedium: photo.url_middle,
    urlSmall: photo.url_small,
})

const mapPhotoV2 = (photo: PhotoBlockV2) => ({
    urlLarge: photo.normal ?? photo.sq_430,
    urlMedium: photo.sq_middle,
    urlSmall: photo.sq_small,
})

const pickAvatar = (profile: ProfileBlock) => {
    const v2 = profile.photos_v2?.map(mapPhotoV2) ?? []
    const legacy = profile.photos?.map(mapPhoto) ?? []
    const candidates = v2.length ? v2 : legacy

    return candidates[0]?.urlLarge ?? candidates[0]?.urlMedium ?? candidates[0]?.urlSmall
}

const mapProfile = (profile: ProfileBlock): UserProfile => {
    const photos = profile.photos_v2?.map(mapPhotoV2) ?? profile.photos?.map(mapPhoto) ?? []

    return {
        id: profile.id ?? 0,
        username: profile.pseudo ?? 'Member',
        fullName: profile.nom_complet ?? profile.prenom,
        age: profile.age,
        gender: mapGender(profile.sexe1),
        location: profile.zone_name,
        email: profile.email,
        lastVisit: profile.visite,
        photoCount: profile.photo,
        avatarUrl: pickAvatar(profile),
        photos,
        description: profile.description,
        height: profile.taille,
        weight: profile.poids,
        eyeColor: profile.yeux,
        hairColor: profile.cheveux,
        situation: profile.situation,
        silhouette: profile.silhouette,
        personality: profile.personnalite,
        schedule: profile.horaires,
        children: profile.child,
        education: profile.etudes,
        profession: profile.travail,
        orientation: profile.sexe2,
    }
}

export const userService = {
    async getProfile(params: { sessionId: string; userId: number }) {
        const response = await userRepo.getProfile({
            sessionId: params.sessionId,
            userId: params.userId,
            withPhotos: true,
        })

        console.log('PROFILE: ', response)

        if (response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        if (!response.result) {
            throw new HttpError('Profile not found', 404)
        }

        return mapProfile(response.result)
    },
    async updateProfile(sessionId: string, payload: UpdateInformationsParams & { description?: string }) {
        const infoResponse = await userRepo.updateInformations({
            ...payload,
            sessionId,
        })

        const descriptionResponse =
            payload.description && payload.description.trim().length
                ? await userRepo.updateDescription({ sessionId, description: payload.description })
                : undefined

        const acceptedInfo = infoResponse.accepted ?? 0
        const acceptedDescription = descriptionResponse?.accepted ?? 1

        if (acceptedInfo === 0) {
            throw new HttpError(infoResponse.error || 'Profile update was not accepted', 400)
        }

        if (descriptionResponse && acceptedDescription === 0) {
            throw new HttpError(descriptionResponse.error || 'Description update was not accepted', 400)
        }

        return {
            accepted: Math.min(acceptedInfo, acceptedDescription),
        } satisfies UpdateProfileResponse
    },
    async logout(sessionId: string): Promise<LogoutResponse> {
        const response = await userRepo.logout(sessionId)
        return {
            connected: response.connected,
            result: response.result,
        }
    },
    async requestPasswordReset(emailOrUsername: string): Promise<LostPassResponse> {
        const response = await userRepo.requestPasswordReset(emailOrUsername)

        if (response.error === 1) {
            throw new HttpError('Account not found', 404)
        }

        return response
    },
    async deleteAccount(
        sessionId: string,
        password?: string
    ): Promise<DeleteAccountResponse & { success: boolean }> {
        const response = await userRepo.deleteAccount({ sessionId, password })

        if (response.error === 1) {
            throw new HttpError(response.result || 'Unable to delete account', 400)
        }

        return {
            success: true,
            result: response.result,
            error: response.error,
        }
    },
}
