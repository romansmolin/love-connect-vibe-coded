import { prisma } from '@/shared/lib/prisma'

export const conversationMessageRepo = {
    list(conversationId: string, before: Date | undefined, limit: number) {
        return prisma.chatMessageRecord.findMany({
            where: { conversationId, ...(before ? { createdAt: { lt: before } } : {}) },
            include: { gift: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
        })
    },
    latest(conversationId: string) {
        return prisma.chatMessageRecord.findFirst({
            where: { conversationId },
            include: { gift: true },
            orderBy: { createdAt: 'desc' },
        })
    },
    findByIdempotencyKey(conversationId: string, idempotencyKey: string) {
        return prisma.chatMessageRecord.findUnique({
            where: { conversationId_idempotencyKey: { conversationId, idempotencyKey } },
            include: { gift: true },
        })
    },
    create(input: {
        conversationId: string
        senderDatingId: number
        body: string
        idempotencyKey: string
        deliveredAt: Date
        isAiGenerated?: boolean
        giftId?: string
        giftTransactionId?: string
    }) {
        return prisma.chatMessageRecord.create({
            data: input,
            include: { gift: true },
        })
    },
}
