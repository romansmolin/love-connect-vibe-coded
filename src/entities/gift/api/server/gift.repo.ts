import crypto from 'node:crypto'

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
        imageUrl: string
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
                    imageUrl: data.imageUrl,
                    priceCents: data.priceCents,
                    currency: data.currency ?? 'EUR',
                    status: data.status ?? 'ACTIVE',
                },
                create: {
                    name: data.name,
                    emoji: data.emoji,
                    imageUrl: data.imageUrl,
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
                imageUrl: data.imageUrl,
                priceCents: data.priceCents,
                currency: data.currency ?? 'EUR',
                status: data.status ?? 'ACTIVE',
            },
        })
    },
    findGiftById(id: string) {
        return prisma.gift.findUnique({ where: { id } })
    },
    archiveMissingGifts(allowedImageUrls: string[]) {
        return prisma.gift.updateMany({
            where: {
                NOT: { imageUrl: { in: allowedImageUrls } },
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
    findChatTransactionByIdempotencyKey(senderId: string, idempotencyKey: string) {
        return prisma.giftTransaction.findUnique({
            where: { senderId_idempotencyKey: { senderId, idempotencyKey } },
            include: { gift: true },
        })
    },
    listDeliveredForConversation(appUserId: string, peerId: string) {
        return prisma.giftTransaction.findMany({
            where: {
                status: 'DELIVERED',
                OR: [
                    { senderId: appUserId, recipientId: peerId },
                    { senderId: peerId, recipientId: appUserId },
                ],
            },
            include: { gift: true },
            orderBy: { deliveredAt: 'asc' },
        })
    },
    listDeliveredForUser(appUserId: string) {
        return prisma.giftTransaction.findMany({
            where: {
                status: 'DELIVERED',
                OR: [{ senderId: appUserId }, { recipientId: appUserId }],
            },
            include: { gift: true },
            orderBy: { deliveredAt: 'desc' },
        })
    },
    async buyAndDeliverWithCredits(params: {
        senderId: string
        recipientId: string
        giftId: string
        giftName: string
        amountCents: number
        currency: string
        credits: number
        idempotencyKey: string
    }) {
        return prisma.$transaction(async (tx) => {
            const existing = await tx.giftTransaction.findUnique({
                where: {
                    senderId_idempotencyKey: {
                        senderId: params.senderId,
                        idempotencyKey: params.idempotencyKey,
                    },
                },
                include: { gift: true },
            })

            if (existing) {
                const wallet = await tx.creditWallet.findUnique({ where: { userId: params.senderId } })
                return { status: 'success' as const, transaction: existing, walletBalance: wallet?.balance ?? 0 }
            }

            const wallet = await tx.creditWallet.upsert({
                where: { userId: params.senderId },
                create: { userId: params.senderId },
                update: {},
            })
            const deduction = await tx.creditWallet.updateMany({
                where: { id: wallet.id, balance: { gte: params.credits } },
                data: { balance: { decrement: params.credits } },
            })

            if (deduction.count !== 1) {
                return { status: 'insufficient-credits' as const }
            }

            const paymentToken = await tx.paymentToken.create({
                data: {
                    token: `pt_credit_${crypto.randomUUID().replace(/-/g, '')}`,
                    userId: params.senderId,
                    itemType: 'ORDER',
                    amountCents: params.amountCents,
                    currency: params.currency,
                    description: `Gift sent in chat: ${params.giftName}`,
                    status: 'SUCCESSFUL',
                    testMode: process.env.NEXT_PUBLIC_SECURE_PROCESSOR_TEST_MODE === 'true',
                    rawPayload: { source: 'credits', channel: 'chat' },
                },
            })

            await tx.creditTransaction.create({
                data: {
                    walletId: wallet.id,
                    userId: params.senderId,
                    type: 'SPEND',
                    status: 'SUCCESSFUL',
                    credits: params.credits,
                    amountCents: params.amountCents,
                    currency: params.currency,
                    description: `Gift sent in chat: ${params.giftName}`,
                },
            })

            const transaction = await tx.giftTransaction.create({
                data: {
                    giftId: params.giftId,
                    paymentTokenId: paymentToken.id,
                    senderId: params.senderId,
                    recipientId: params.recipientId,
                    matchId: `${params.senderId}-${params.recipientId}`,
                    idempotencyKey: params.idempotencyKey,
                    status: 'DELIVERED',
                    amountCents: params.amountCents,
                    currency: params.currency,
                    deliveredAt: new Date(),
                },
                include: { gift: true },
            })
            const updatedWallet = await tx.creditWallet.findUniqueOrThrow({ where: { id: wallet.id } })

            return {
                status: 'success' as const,
                transaction,
                walletBalance: updatedWallet.balance,
            }
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
