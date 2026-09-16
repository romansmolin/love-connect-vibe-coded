import type { Prisma, SimulatedMessage } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

export type SimulatedMessageWithGift = Prisma.SimulatedMessageGetPayload<{
    include: { giftTransaction: { include: { gift: true } } }
}>

export const simulatedMessageRepo = {
    async listByConversation(
        appUserId: string,
        personaId: string,
        limit: number
    ): Promise<SimulatedMessageWithGift[]> {
        const rows = await prisma.simulatedMessage.findMany({
            where: { appUserId, personaId },
            include: { giftTransaction: { include: { gift: true } } },
            orderBy: { sentAt: 'desc' },
            take: limit,
        })
        return rows.reverse()
    },
    insertInbound(
        appUserId: string,
        personaId: string,
        text: string,
        scheduledReplyAt: Date,
        idempotencyKey?: string
    ): Promise<SimulatedMessage> {
        return prisma.simulatedMessage.create({
            data: { appUserId, personaId, senderIsPersona: false, text, scheduledReplyAt, idempotencyKey },
        })
    },
    findByIdempotencyKey(appUserId: string, personaId: string, idempotencyKey: string) {
        return prisma.simulatedMessage.findUnique({
            where: { appUserId_personaId_idempotencyKey: { appUserId, personaId, idempotencyKey } },
        })
    },
    async ensureGiftMessage(params: {
        appUserId: string
        personaId: string
        giftTransactionId: string
        text: string
        scheduledReplyAt: Date
    }): Promise<SimulatedMessageWithGift> {
        return prisma.simulatedMessage.upsert({
            where: { giftTransactionId: params.giftTransactionId },
            create: {
                appUserId: params.appUserId,
                personaId: params.personaId,
                senderIsPersona: false,
                text: params.text,
                giftTransactionId: params.giftTransactionId,
                scheduledReplyAt: params.scheduledReplyAt,
            },
            update: {},
            include: { giftTransaction: { include: { gift: true } } },
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
    /** Undo a claim so a failed reply generation can be retried on a later tick. */
    async releaseReply(id: string): Promise<void> {
        await prisma.simulatedMessage.updateMany({ where: { id }, data: { repliedAt: null } })
    },
}
