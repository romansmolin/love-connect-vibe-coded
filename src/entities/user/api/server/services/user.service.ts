import { HttpError } from '@/shared/http-client'

import type { UserGender, UserProfile } from '../../../model/types'
import { userRepo } from '../repositories/user.repo'
import type { PhotoBlock, PhotoBlockV2, ProfileBlock } from '../repositories/user.repo'

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
}
