import { paymentService } from '@/entities/payment/api/server/payment.service'
import { HttpError } from '@/shared/http-client'
import { centsFromCredits } from '@/shared/lib/credits'

import type { CreditTransactionStatus } from '../../model/types'

import { creditRepo } from './credit.repo'

const mapStatusFromPayment = (status: string): CreditTransactionStatus => {
    switch (status) {
        case 'SUCCESSFUL':
            return 'SUCCESSFUL'
        case 'FAILED':
        case 'DECLINED':
        case 'EXPIRED':
        case 'ERROR':
            return 'FAILED'
        case 'PENDING':
        case 'CREATED':
        default:
            return 'PENDING'
    }
}

const ensureWallet = async (userId: string) => {
    const existing = await creditRepo.findWalletByUserId(userId)
    if (existing) return existing
    return creditRepo.upsertWallet(userId)
}

export const creditService = {
    async getWallet(userId: string) {
        const wallet = await ensureWallet(userId)
        const transactions = await creditRepo.listTransactions(userId)

        const totals = transactions.reduce(
            (acc, transaction) => {
                if (transaction.type === 'PURCHASE') {
                    if (transaction.status === 'SUCCESSFUL') {
                        acc.totalPurchased += transaction.credits
                    } else if (transaction.status === 'PENDING' || transaction.status === 'CREATED') {
                        acc.pendingCredits += transaction.credits
                    }
                }

                if (transaction.type === 'SPEND' && transaction.status === 'SUCCESSFUL') {
                    acc.totalSpent += transaction.credits
                }

                return acc
            },
            { totalPurchased: 0, totalSpent: 0, pendingCredits: 0 }
        )

        return {
            wallet: {
                balance: wallet.balance,
                currency: wallet.currency,
                totalPurchased: totals.totalPurchased,
                totalSpent: totals.totalSpent,
                pendingCredits: totals.pendingCredits,
            },
            transactions: transactions.map((transaction) => ({
                id: transaction.id,
                walletId: transaction.walletId,
                userId: transaction.userId,
                paymentTokenId: transaction.paymentTokenId,
                type: transaction.type,
                status: transaction.status,
                credits: transaction.credits,
                amountCents: transaction.amountCents,
                currency: transaction.currency,
                description: transaction.description,
                createdAt: transaction.createdAt.toISOString(),
                updatedAt: transaction.updatedAt.toISOString(),
            })),
            total: transactions.length,
        }
    },

    async createPurchase(params: { userId: string; credits: number }) {
        if (!params.credits || params.credits <= 0) {
            throw new HttpError('Credits amount must be greater than zero.', 400)
        }

        const wallet = await ensureWallet(params.userId)
        const amountCents = centsFromCredits(params.credits)

        console.log('[credit-purchase] creating checkout', {
            userId: params.userId,
            credits: params.credits,
            amountCents,
            currency: 'EUR',
        })

        let payment: Awaited<ReturnType<typeof paymentService.createCheckoutToken>>
        try {
            payment = await paymentService.createCheckoutToken({
                userId: params.userId,
                amountCents,
                currency: 'EUR',
                description: `Credit purchase: ${params.credits} credits`,
                itemType: 'order',
                referenceId: `credits:${params.credits}`,
            })
        } catch (error) {
            console.error('[credit-purchase] checkout failed', error)
            throw error
        }

        const transaction = await creditRepo.createTransaction({
            walletId: wallet.id,
            userId: params.userId,
            paymentTokenId: payment.paymentToken.id,
            type: 'PURCHASE',
            status: 'PENDING',
            credits: params.credits,
            amountCents,
            currency: 'EUR',
            description: `Purchase ${params.credits} credits`,
        })

        console.log('[credit-purchase] transaction created', {
            transactionId: transaction.id,
            paymentTokenId: payment.paymentToken.id,
            checkoutToken: Boolean(payment.checkout.token),
        })

        return { transaction, paymentToken: payment.paymentToken, checkout: payment.checkout }
    },

    async fulfillPaymentToken(paymentTokenId: string) {
        const transaction = await creditRepo.findTransactionByPaymentTokenId(paymentTokenId)
        if (!transaction || !transaction.paymentToken) return null

        if (transaction.status === 'SUCCESSFUL') {
            return transaction
        }

        const mapped = mapStatusFromPayment(transaction.paymentToken.status)

        if (mapped === 'SUCCESSFUL') {
            await creditRepo.updateWalletBalance(transaction.walletId, transaction.credits)
        }

        return creditRepo.updateTransactionStatus(transaction.id, mapped)
    },
}
