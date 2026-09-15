import type { SimulatedMessage } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

export const simulatedMessageRepo = {
    async listByConversation(appUserId: string, personaId: string, limit: number): Promise<SimulatedMessage[]> {
        const rows = await prisma.simulatedMessage.findMany({
            where: { appUserId, personaId },
            orderBy: { sentAt: 'desc' },
            take: limit,
        })
        return rows.reverse()
    },
    insertInbound(
        appUserId: string,
        personaId: string,
        text: string,
        scheduledReplyAt: Date
    ): Promise<SimulatedMessage> {
        return prisma.simulatedMessage.create({
            data: { appUserId, personaId, senderIsPersona: false, text, scheduledReplyAt },
        })
    },
    insertPersonaReply(appUserId: string, personaId: string, text: string): Promise<SimulatedMessage> {
        return prisma.simulatedMessage.create({
            data: { appUserId, personaId, senderIsPersona: true, text },
        })
    },
    findDueForReply(now: Date, limit: number): Promise<SimulatedMessage[]> {
        return prisma.simulatedMessage.findMany({
            where: { senderIsPersona: false, scheduledReplyAt: { lte: now }, repliedAt: null },
            orderBy: { scheduledReplyAt: 'asc' },
            take: limit,
        })
    },
    findDueForConversation(appUserId: string, personaId: string, now: Date): Promise<SimulatedMessage[]> {
        return prisma.simulatedMessage.findMany({
            where: {
                appUserId,
                personaId,
                senderIsPersona: false,
                scheduledReplyAt: { lte: now },
                repliedAt: null,
            },
        })
    },
    async claimReply(id: string, now: Date): Promise<boolean> {
        const result = await prisma.simulatedMessage.updateMany({
            where: { id, repliedAt: null },
            data: { repliedAt: now },
        })
        return result.count === 1
    },
}
