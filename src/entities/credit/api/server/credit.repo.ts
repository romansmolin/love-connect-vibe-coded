import { prisma } from '@/shared/lib/prisma'

import type { CreditTransactionStatus, CreditTransactionType } from '../../model/types'

export const creditRepo = {
    findWalletByUserId(userId: string) {
        return prisma.creditWallet.findUnique({
            where: { userId },
        })
    },

    upsertWallet(userId: string) {
        return prisma.creditWallet.upsert({
            where: { userId },
            create: { userId },
            update: {},
        })
    },

    updateWalletBalance(walletId: string, delta: number) {
        return prisma.creditWallet.update({
            where: { id: walletId },
            data: {
                balance: {
                    increment: delta,
                },
            },
        })
    },

    listTransactions(userId: string) {
        return prisma.creditTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        })
    },

    createTransaction(params: {
        walletId: string
        userId: string
        paymentTokenId?: string | null
        type: CreditTransactionType
        status: CreditTransactionStatus
        credits: number
        amountCents: number
        currency: string
        description?: string | null
    }) {
        return prisma.creditTransaction.create({
            data: params,
        })
    },

    findTransactionByPaymentTokenId(paymentTokenId: string) {
        return prisma.creditTransaction.findFirst({
            where: { paymentTokenId },
            include: { wallet: true, paymentToken: true },
        })
    },

    updateTransactionStatus(
        id: string,
        status: CreditTransactionStatus,
        data?: { description?: string | null; paymentTokenId?: string | null }
    ) {
        return prisma.creditTransaction.update({
            where: { id },
            data: {
                status,
                description: data?.description,
                paymentTokenId: data?.paymentTokenId,
            },
        })
    },
}
