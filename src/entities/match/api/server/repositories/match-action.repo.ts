import type { MatchActionType } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

export const matchActionRepo = {
    recordAction(params: { userId: string; targetUserId: number; action: MatchActionType; isMatch: boolean }) {
        return prisma.matchAction.upsert({
            where: { userId_targetUserId: { userId: params.userId, targetUserId: params.targetUserId } },
            update: { action: params.action, isMatch: params.isMatch },
            create: params,
        })
    },
    async listActedTargetIds(userId: string): Promise<number[]> {
        const rows = await prisma.matchAction.findMany({
            where: { userId },
            select: { targetUserId: true },
        })
        return rows.map((row) => row.targetUserId)
    },
}
