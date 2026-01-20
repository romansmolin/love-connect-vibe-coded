import { matchService } from '@/entities/match/api/server/services/match.service'
import { paymentService } from '@/entities/payment/api/server/payment.service'
import { HttpError } from '@/shared/http-client'

import type { GiftTransaction, GiftTransactionStatus } from '../../model/types'

import { giftRepo } from './gift.repo'

const defaultCatalog = [
    { name: 'Balloon', emoji: '🎈', priceCents: 10 },
    { name: 'Party Popper', emoji: '🎉', priceCents: 10 },
    { name: 'Rose', emoji: '🌹', priceCents: 10 },
    { name: 'Chocolate', emoji: '🍫', priceCents: 10 },
    { name: 'Coffee', emoji: '☕️', priceCents: 10 },
    { name: 'Gem', emoji: '💎', priceCents: 10 },
]

const seedCatalogIfEmpty = async () => {
    const existing = await giftRepo.listActiveGifts()

    const defaultEmojis = defaultCatalog.map((gift) => gift.emoji)

    // Upsert default gifts (update price/name/emoji if already present)
    await Promise.all(
        defaultCatalog.map((gift) => {
            const matched = existing.find((item) => item.emoji === gift.emoji || item.name === gift.name)

            return giftRepo.upsertGift({
                id: matched?.id,
                name: gift.name,
                emoji: gift.emoji,
                priceCents: gift.priceCents,
                currency: 'EUR',
                status: 'ACTIVE',
            })
        })
    )

    // Archive any old gifts that are not in the default set so they don’t clutter the gallery
    await giftRepo.archiveMissingGifts(defaultEmojis)

    return giftRepo.listActiveGifts()
}

const ensureMatch = async (sessionId: string, recipientId: string | number) => {
    const matches = await matchService.listMatches(sessionId)
    const recipientNumeric = Number(recipientId)
    const found = matches.items.find((item) => Number(item.id) === recipientNumeric)
    if (!found) {
        throw new HttpError('Match not found. Gifts can be sent only to matched users.', 403)
    }
    return found
}

const mapStatusFromPayment = (status: string, hasRecipient: boolean): GiftTransactionStatus => {
    switch (status) {
        case 'SUCCESSFUL':
            return hasRecipient ? 'DELIVERED' : 'AVAILABLE'
        case 'FAILED':
        case 'DECLINED':
        case 'EXPIRED':
        case 'ERROR':
            return 'PAYMENT_FAILED'
        case 'PENDING':
        case 'CREATED':
        default:
            return 'PAYMENT_PENDING'
    }
}

export const giftService = {
    async listCatalog() {
        return seedCatalogIfEmpty()
    },

    async createPurchase(params: { senderId: string; giftId: string }) {
        const gift = await giftRepo.findGiftById(params.giftId)
        if (!gift || gift.status !== 'ACTIVE') {
            console.warn('[gift-purchase] gift not available', { giftId: params.giftId, status: gift?.status })
            throw new HttpError('Gift not available', 404)
        }

        console.log('[gift-purchase] creating checkout', {
            senderId: params.senderId,
            giftId: params.giftId,
            priceCents: gift.priceCents,
            currency: gift.currency,
        })

        let payment: Awaited<ReturnType<typeof paymentService.createCheckoutToken>>
        try {
            payment = await paymentService.createCheckoutToken({
                userId: params.senderId,
                amountCents: gift.priceCents,
                currency: gift.currency as 'EUR',
                description: `Gift purchase: ${gift.name}`,
                itemType: 'order',
                referenceId: params.giftId,
            })
        } catch (error) {
            console.error('[gift-purchase] checkout failed', error)
            throw error
        }

        const transaction = await giftRepo.createTransaction({
            giftId: gift.id,
            paymentTokenId: payment.paymentToken.id,
            senderId: params.senderId,
            recipientId: null,
            matchId: null,
            amountCents: gift.priceCents,
            currency: gift.currency,
            status: 'PAYMENT_PENDING',
            gatewayUid: payment.paymentToken.gatewayUid,
        })

        console.log('[gift-purchase] transaction created', {
            transactionId: transaction.id,
            paymentTokenId: payment.paymentToken.id,
            checkoutToken: Boolean(payment.checkout.token),
        })

        return { transaction, paymentToken: payment.paymentToken, checkout: payment.checkout }
    },

    async listInventory(senderId: string) {
        const transactions = await giftRepo.listInventory(senderId)
        return {
            items: transactions.map((transaction) => ({
                id: transaction.id,
                gift: transaction.gift,
                status: transaction.status as GiftTransactionStatus,
                createdAt: transaction.createdAt.toISOString(),
                deliveredAt: transaction.deliveredAt ? transaction.deliveredAt.toISOString() : null,
            })),
            total: transactions.length,
        }
    },

    async sendGift(params: { sessionId: string; senderId: string; transactionId: string; recipientId: string }) {
        const transaction = await giftRepo.findTransactionById(params.transactionId)
        if (!transaction) {
            throw new HttpError('Gift not found', 404)
        }
        if (transaction.senderId !== params.senderId) {
            throw new HttpError('You can only send gifts you purchased.', 403)
        }
        if (transaction.status !== 'AVAILABLE') {
            throw new HttpError('Gift is not available to send yet.', 400)
        }

        await ensureMatch(params.sessionId, params.recipientId)

        const matchId = `${params.senderId}-${params.recipientId}`

        return giftRepo.updateTransactionStatus(transaction.id, 'DELIVERED', {
            recipientId: params.recipientId,
            matchId,
            deliveredAt: new Date(),
        })
    },

    async fulfillPaymentToken(
        paymentTokenId: string,
        gatewayUid?: string | null,
        rawPayload?: unknown
    ): Promise<GiftTransaction | null> {
        const transaction = await giftRepo.findTransactionByPaymentTokenId(paymentTokenId)
        if (!transaction) return null

        if (transaction.status === 'DELIVERED') {
            return transaction as GiftTransaction
        }

        const status = mapStatusFromPayment(transaction.paymentToken.status, Boolean(transaction.recipientId))

        return giftRepo.updateTransactionStatus(transaction.id, status, {
            deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
            rawPayload,
            gatewayUid: gatewayUid ?? transaction.gatewayUid,
        })
    },
}
