import type { NextRequest } from 'next/server'

import { HttpError } from '@/shared/http-client'

import type { UserProfileResponse } from '../../../model/types'
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
}
