import { prisma } from '@/shared/lib/prisma'

import type { GiftStatus, GiftTransactionStatus } from '../../model/types'

export const giftRepo = {
    listActiveGifts() {
        return prisma.gift.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { priceCents: 'asc' },
        })
    },
    upsertGift(data: {
        id?: string
        name: string
        emoji: string
        priceCents: number
        currency?: string
        status?: GiftStatus
    }) {
        if (data.id) {
            return prisma.gift.upsert({
                where: { id: data.id },
                update: {
                    name: data.name,
                    emoji: data.emoji,
                    priceCents: data.priceCents,
                    currency: data.currency ?? 'EUR',
                    status: data.status ?? 'ACTIVE',
                },
                create: {
                    name: data.name,
                    emoji: data.emoji,
                    priceCents: data.priceCents,
                    currency: data.currency ?? 'EUR',
                    status: data.status ?? 'ACTIVE',
                },
            })
        }

        return prisma.gift.create({
            data: {
                name: data.name,
                emoji: data.emoji,
                priceCents: data.priceCents,
                currency: data.currency ?? 'EUR',
                status: data.status ?? 'ACTIVE',
            },
        })
    },
    findGiftById(id: string) {
        return prisma.gift.findUnique({ where: { id } })
    },
    archiveMissingGifts(allowedEmojis: string[]) {
        return prisma.gift.updateMany({
            where: {
                NOT: { emoji: { in: allowedEmojis } },
                status: 'ACTIVE',
            },
            data: { status: 'ARCHIVED' },
        })
    },
    createTransaction(params: {
        giftId: string
        paymentTokenId: string
        senderId: string
        recipientId?: string | null
        matchId?: string | null
        amountCents: number
        currency: string
        status?: GiftTransactionStatus
        gatewayUid?: string | null
    }) {
        return prisma.giftTransaction.create({
            data: {
                giftId: params.giftId,
                paymentTokenId: params.paymentTokenId,
                senderId: params.senderId,
                recipientId: params.recipientId ?? null,
                matchId: params.matchId ?? null,
                amountCents: params.amountCents,
                currency: params.currency,
                status: params.status ?? 'CREATED',
                gatewayUid: params.gatewayUid,
            },
        })
    },
    listInventory(senderId: string) {
        return prisma.giftTransaction.findMany({
            where: { senderId, status: 'AVAILABLE' },
            include: { gift: true },
            orderBy: { createdAt: 'desc' },
        })
    },
    findTransactionById(id: string) {
        return prisma.giftTransaction.findUnique({
            where: { id },
            include: { gift: true, paymentToken: true },
        })
    },
    findTransactionByPaymentTokenId(paymentTokenId: string) {
        return prisma.giftTransaction.findFirst({
            where: { paymentTokenId },
            include: { gift: true, paymentToken: true },
        })
    },
    updateTransactionStatus(
        id: string,
        status: GiftTransactionStatus,
        data?: {
            deliveredAt?: Date | null
            rawPayload?: unknown
            gatewayUid?: string | null
            recipientId?: string | null
            matchId?: string | null
        }
    ) {
        return prisma.giftTransaction.update({
            where: { id },
            data: {
                status,
                deliveredAt: data?.deliveredAt,
                rawPayload: data?.rawPayload as any,
                gatewayUid: data?.gatewayUid,
                recipientId: data?.recipientId,
                matchId: data?.matchId,
            },
        })
    },
}
