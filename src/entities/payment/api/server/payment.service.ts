import crypto from 'node:crypto'

import { Prisma } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

import type { PaymentToken, PaymentTokenStatus } from '../../model/types'

const SHOP_ID = process.env.SECURE_PROCESSOR_SHOP_ID ?? ''
const SECRET_KEY = process.env.SECURE_PROCESSOR_SECRET_KEY ?? ''
const PUBLIC_KEY = process.env.SECURE_PROCESSOR_PUBLIC_KEY ?? ''
const API_BASE_URL = process.env.SECURE_PROCESSOR_API_BASE_URL ?? 'https://checkout.secure-processor.com'
const CHECKOUT_PATH = process.env.SECURE_PROCESSOR_CHECKOUT_TOKEN_PATH ?? '/ctp/api/checkouts'
const FRONTEND_URL =
    process.env.FRONTEND_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ''

const isTestMode = () => process.env.NEXT_PUBLIC_SECURE_PROCESSOR_TEST_MODE === 'true'

const mapSecureProcessorStatus = (status?: string): PaymentTokenStatus => {
    switch ((status ?? '').toLowerCase()) {
        case 'successful':
        case 'success':
        case 'completed':
            return 'SUCCESSFUL'
        case 'failed':
        case 'failure':
            return 'FAILED'
        case 'declined':
        case 'rejected':
            return 'DECLINED'
        case 'expired':
            return 'EXPIRED'
        case 'error':
            return 'ERROR'
        case 'pending':
        default:
            return 'PENDING'
    }
}

const authHeaders = () => {
    // BeGateway / Secure Processor accepts basic auth (shop_id:secret_key)
    const basic = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64')
    return {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
}

const verifySignature = (payload: Buffer, signature?: string) => {
    if (!signature || !PUBLIC_KEY) return true
    try {
        const verifier = crypto.createVerify('RSA-SHA256')
        verifier.update(payload)
        verifier.end()
        return verifier.verify(PUBLIC_KEY, signature, 'base64')
    } catch (error) {
        console.error('[secure-processor] Signature verify failed', error)
        return false
    }
}

const fulfillCallback = async (paymentTokenId: string) => {
    // Fulfillment is implemented by the feature module (e.g., gifts).
    // Importing lazily to avoid circular deps.
    const { giftService } = await import('@/entities/gift/api/server/gift.service')
    await giftService.fulfillPaymentToken(paymentTokenId)
    const { creditService } = await import('@/entities/credit/api/server/credit.service')
    await creditService.fulfillPaymentToken(paymentTokenId)
}

export const paymentService = {
    mapSecureProcessorStatus,

    async createCheckoutToken(params: {
        userId: string
        amountCents: number
        currency: 'EUR'
        description: string
        itemType: 'one_time' | 'order' | 'subscription'
        referenceId?: string
    }) {
        const paymentToken = await prisma.paymentToken.create({
            data: {
                token: `pt_${crypto.randomUUID().replace(/-/g, '')}`,
                userId: params.userId,
                itemType: params.itemType.toUpperCase(),
                amountCents: params.amountCents,
                currency: params.currency,
                description: params.description,
                status: 'CREATED',
                testMode: isTestMode(),
            },
        })

        const returnUrlBase = BACKEND_URL || FRONTEND_URL
        const normalizedBase = returnUrlBase ? returnUrlBase.replace(/\/$/, '') : undefined
        const returnUrl = normalizedBase
            ? `${normalizedBase}/api/payments/secure-processor/return?token=${paymentToken.token}`
            : undefined

        const payload = {
            checkout: {
                // BeGateway v2 style payload
                version: 2.1,
                transaction_type: 'payment',
                test: isTestMode(),
                settings: {
                    return_url: returnUrl,
                },
                order: {
                    amount: params.amountCents,
                    currency: params.currency,
                    description: params.description,
                },
                customer: {
                    id: params.userId,
                },
                metadata: {
                    payment_token_id: paymentToken.id,
                    user_id: params.userId,
                    reference_id: params.referenceId,
                },
            },
        }

        let checkoutToken: string | undefined
        try {
            const response = await fetch(`${API_BASE_URL}${CHECKOUT_PATH}`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payload),
            })

            const json = (await response.json()) as {
                token?: string
                checkout?: { token?: string; redirect_url?: string }
                message?: string
                error?: unknown
            }

            console.log('response: ', response)
            const resolvedToken = json.token ?? json.checkout?.token
            if (!response.ok || !resolvedToken) {
                throw new Error(
                    `Checkout token missing (status ${response.status}). Response: ${JSON.stringify(json)}`
                )
            }

            checkoutToken = resolvedToken

            await prisma.paymentToken.update({
                where: { id: paymentToken.id },
                data: {
                    gatewayUid: resolvedToken ?? null,
                    rawPayload: (json ?? Prisma.JsonNull) as Prisma.InputJsonValue,
                    status: 'PENDING',
                },
            })
        } catch (error) {
            console.error('[secure-processor] Failed to create checkout token', error)
            // Mark payment token as failed so downstream handlers know this attempt is unusable
            await prisma.paymentToken.update({
                where: { id: paymentToken.id },
                data: { status: 'FAILED', rawPayload: { error: String(error) } as Prisma.InputJsonValue },
            })
            throw error
        }

        const updated = await prisma.paymentToken.findUniqueOrThrow({ where: { id: paymentToken.id } })

        return {
            paymentToken: updated as PaymentToken,
            checkout: { token: checkoutToken },
        }
    },

    async handleReturn(params: { token?: string | null; status?: string | null; uid?: string | null }) {
        if (!params.token) {
            throw new Error('Payment token missing')
        }
        const paymentToken = await prisma.paymentToken.findUnique({ where: { token: params.token } })
        if (!paymentToken) {
            throw new Error('Payment token not found')
        }

        const mapped = mapSecureProcessorStatus(params.status ?? undefined)
        const updated = await prisma.paymentToken.update({
            where: { id: paymentToken.id },
            data: { status: mapped, gatewayUid: params.uid ?? paymentToken.gatewayUid },
        })

        await fulfillCallback(paymentToken.id)

        return updated
    },

    async processWebhook(payloadBuffer: Buffer, signature?: string) {
        if (!verifySignature(payloadBuffer, signature)) {
            throw new Error('Invalid signature')
        }

        const payload = JSON.parse(payloadBuffer.toString('utf-8')) as {
            status?: string
            uid?: string
            payment_token_id?: string
            metadata?: { payment_token_id?: string }
        }

        const tokenId = payload.payment_token_id ?? payload.metadata?.payment_token_id
        if (!tokenId) {
            throw new Error('payment_token_id missing in webhook')
        }

        const paymentToken = await prisma.paymentToken.findFirst({
            where: { OR: [{ id: tokenId }, { gatewayUid: payload.uid }] },
        })

        if (!paymentToken) {
            throw new Error('PaymentToken not found for webhook')
        }

        const mapped = mapSecureProcessorStatus(payload.status)
        const updated = await prisma.paymentToken.update({
            where: { id: paymentToken.id },
            data: { status: mapped, gatewayUid: payload.uid ?? paymentToken.gatewayUid, rawPayload: payload },
        })

        await fulfillCallback(paymentToken.id)

        return updated
    },
}
