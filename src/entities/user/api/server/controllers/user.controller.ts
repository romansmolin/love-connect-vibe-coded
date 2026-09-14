import type { NextRequest } from 'next/server'

import { HttpError } from '@/shared/http-client'

import type { PublicMemberProfileResponse, UpdateProfileRequest, UserProfileResponse } from '../../../model/types'
import { SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '../config'
import { userService } from '../services/user.service'

const requireSessionId = (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!sessionId) {
        throw new HttpError('Unauthorized', 401)
    }

    return sessionId
}

const requireUserId = (request: NextRequest) => {
    const value = request.cookies.get(USER_COOKIE_NAME)?.value
    const userId = value ? Number(value) : NaN

    if (!Number.isFinite(userId)) {
        throw new HttpError('Unauthorized', 401)
    }

    return userId
}

export const userController = {
    async getProfile(request: NextRequest): Promise<UserProfileResponse> {
        const sessionId = requireSessionId(request)
        const userId = requireUserId(request)

        const user = await userService.getProfile({ sessionId, userId })

        return { user }
    },
    async getMemberProfile(request: NextRequest, memberId: number): Promise<PublicMemberProfileResponse> {
        const sessionId = requireSessionId(request)

        if (!Number.isFinite(memberId) || memberId <= 0) {
            throw new HttpError('Invalid member id', 400)
        }

        const user = await userService.getMemberProfile({ sessionId, userId: memberId })

        return { user }
    },
    async updateProfile(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const body = (await request.json().catch(() => null)) as Partial<UpdateProfileRequest> | null

        if (!body || typeof body !== 'object' || typeof body.fullName !== 'string') {
            throw new HttpError('Invalid request payload', 400)
        }

        const toNumber = (value: unknown): number | undefined => {
            const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : undefined
            return Number.isFinite(n as number) ? (n as number) : undefined
        }

        const toNumberArray = (value: unknown): number[] | undefined => {
            if (!Array.isArray(value)) return undefined
            const nums = value
                .map((item) => toNumber(item))
                .filter((item): item is number => typeof item === 'number')
            return nums.length ? nums : undefined
        }

        return userService.updateProfile(sessionId, {
            sessionId,
            fullName: body.fullName,
            height: toNumber(body.height),
            weight: toNumber(body.weight),
            eyeColor: toNumber(body.eyeColor),
            hairColor: toNumber(body.hairColor),
            situation: toNumber(body.situation),
            silhouette: toNumber(body.silhouette),
            personality: toNumber(body.personality),
            schedule: toNumber(body.schedule),
            orientation: toNumber(body.orientation),
            children: toNumber(body.children),
            education: toNumber(body.education),
            profession: toNumber(body.profession),
            email: typeof body.email === 'string' ? body.email : undefined,
            langUi: typeof body.langUi === 'string' ? body.langUi : undefined,
            bodyOptions: toNumberArray(body.bodyOptions),
            description: typeof body.description === 'string' ? body.description : undefined,
        })
    },
    async logout(request: NextRequest) {
        const sessionId = requireSessionId(request)
        return userService.logout(sessionId)
    },
    async requestPasswordReset(request: NextRequest) {
        const body = (await request.json().catch(() => null)) as { emailOrUsername?: string } | null

        if (!body || typeof body.emailOrUsername !== 'string' || !body.emailOrUsername.trim()) {
            throw new HttpError('Invalid request payload', 400)
        }

        return userService.requestPasswordReset(body.emailOrUsername.trim())
    },
    async uploadPhoto(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const formData = await request.formData()

        const file = formData.get('file')
        if (!(file instanceof Blob)) {
            throw new HttpError('Missing file', 400)
        }

        const filename = file instanceof File ? file.name : 'photo.jpg'

        const x = Number(formData.get('x'))
        const y = Number(formData.get('y'))
        const w = Number(formData.get('w'))
        const h = Number(formData.get('h'))

        if (![x, y, w, h].every(Number.isFinite) || w < 215 || h < 215) {
            throw new HttpError('Invalid crop dimensions. Minimum size is 215x215px.', 400)
        }

        const photos = await userService.uploadPhoto({
            sessionId,
            file,
            filename,
            crop: { x, y, w, h },
        })

        return { photos }
    },
    async deleteAccount(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const body = (await request.json().catch(() => null)) as { password?: string } | null
        const password =
            body && typeof body.password === 'string' && body.password.trim().length ? body.password : undefined

        return userService.deleteAccount(sessionId, password)
    },
}
