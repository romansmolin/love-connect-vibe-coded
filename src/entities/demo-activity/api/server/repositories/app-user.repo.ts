import type { AppUser } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

const STALE_AFTER_MS = 60 * 60 * 1000

export const appUserRepo = {
    async touch(appUserId: string): Promise<void> {
        const existing = await prisma.appUser.findUnique({
            where: { id: appUserId },
            select: { lastSeenAt: true },
        })

        const isStale = !existing || Date.now() - existing.lastSeenAt.getTime() > STALE_AFTER_MS

        if (!isStale) return

        await prisma.appUser.upsert({
            where: { id: appUserId },
            update: { lastSeenAt: new Date() },
            create: { id: appUserId },
        })
    },
    listAll(): Promise<AppUser[]> {
        return prisma.appUser.findMany()
    },
}
