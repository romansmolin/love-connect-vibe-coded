import 'server-only'

import { NextRequest } from 'next/server'
import { AppError } from '@/shared/errors/app-error'
import { prisma } from '@/shared/lib/database/prisma'
import { getSession } from './get-session'

const APP_DATA_NAMESPACE = process.env.APP_DATA_NAMESPACE?.trim() || 'love-bond'

export const toShadowUserId = (datingUserId: string): string =>
    `${APP_DATA_NAMESPACE}:dating:${datingUserId}`

export const ensureShadowUser = async (datingUserId: string): Promise<string> => {
    const userId = toShadowUserId(datingUserId)
    const now = new Date()

    await prisma.user.upsert({
        where: { id: userId },
        update: { updatedAt: now },
        create: {
            id: userId,
            name: `Dating User ${datingUserId}`,
            email: `${APP_DATA_NAMESPACE}-dating-user-${datingUserId}@love-bond.local`,
            emailVerified: false,
            image: null,
            createdAt: now,
            updatedAt: now,
        },
    })

    return userId
}

export async function resolveAppUserId(request: NextRequest): Promise<string> {
    const session = await getSession()
    const userId = session?.user?.id

    if (userId) return userId

    const datingUserId = request.cookies.get('dating_user_id')?.value?.trim()
    if (datingUserId) {
        return ensureShadowUser(datingUserId)
    }

    throw AppError.authenticationError()
}
