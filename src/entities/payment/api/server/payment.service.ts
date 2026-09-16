import crypto from 'node:crypto'

import { Prisma } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

import type { PaymentToken, PaymentTokenStatus } from '../../model/types'

const readRequired = (name: string): string => {
    const value = process.env[name]
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required env var: ${name}`)
    }
    return value
}

const formatPublicKey = (raw: string): string => {
    const normalized = raw
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\r?\n/g, '')
        .replace(/\\n/g, '')
        .trim()
    const wrapped = normalized.match(/.{1,64}/g)?.join('\n') ?? normalized
    return `-----BEGIN PUBLIC KEY-----\n${wrapped}\n-----END PUBLIC KEY-----`
}

const SHOP_ID = readRequired('SECURE_PROCESSOR_SHOP_ID')
const SECRET_KEY = readRequired('SECURE_PROCESSOR_SECRET_KEY')
const PUBLIC_KEY = formatPublicKey(readRequired('SECURE_PROCESSOR_PUBLIC_KEY'))
const API_BASE_URL = (
    process.env.SECURE_PROCESSOR_API_BASE_URL ?? 'https://checkout.secure-processor.com'
).replace(/\/$/, '')
const CHECKOUT_PATH = process.env.SECURE_PROCESSOR_CHECKOUT_TOKEN_PATH ?? '/ctp/api/checkouts'
const BACKEND_URL = readRequired('BACKEND_URL').replace(/\/$/, '')

const AUTH_HEADER = `Basic ${Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64')}`

const assertValidBackendUrl = () => {
    if (process.env.NODE_ENV === 'production' && BACKEND_URL.startsWith('http://')) {
        throw new Error('BACKEND_URL must use HTTPS in production for payment callbacks')
    }
}

const isTestMode = () => process.env.NEXT_PUBLIC_SECURE_PROCESSOR_TEST_MODE === 'true'

const mapSecureProcessorStatus = (status?: string | null): PaymentTokenStatus => {
    switch ((status ?? '').toLowerCase()) {
        case 'successful':
        case 'success':
        case 'completed':
        case 'paid':
        case 'approved':
            return 'SUCCESSFUL'
        case 'failed':
        case 'failure':
            return 'FAILED'
        case 'declined':
        case 'rejected':
        case 'canceled':
        case 'cancelled':
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

const authHeaders = () => ({
    Authorization: AUTH_HEADER,
    'Content-Type': 'application/json',
    Accept: 'application/json',
})

const verifyBasicAuth = (authorization?: string | null) => {
    if (!authorization?.startsWith('Basic ')) {
        throw new Error('Webhook authorization header is missing')
    }
    const provided = Buffer.from(authorization.slice('Basic '.length).trim())
    const expected = Buffer.from(AUTH_HEADER.slice('Basic '.length))
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
        throw new Error('Webhook authorization failed')
    }
}

const extractSignature = (header: string): string => {
    const trimmed = header.trim()
    if (trimmed.includes('=')) {
        const [, value] = trimmed.split('=')
        if (value) return value
    }
    return trimmed
}

const verifySignature = (payload: Buffer, header?: string | null) => {
    if (!header) {
        throw new Error('Content-Signature header is missing')
    }
    const signature = extractSignature(header)
    const ok = crypto.verify('RSA-SHA256', payload, PUBLIC_KEY, Buffer.from(signature, 'base64'))
    if (!ok) {
        throw new Error('Invalid webhook signature')
    }
}

const extractCheckoutDetails = (payload: any) => {
    const checkout = payload?.checkout ?? {}
    const transaction = payload?.transaction ?? {}
    const root =
        Object.keys(checkout).length > 0
            ? checkout
            : Object.keys(transaction).length > 0
              ? transaction
              : (payload ?? {})
    const order = root.order ?? payload?.order ?? {}
    const gatewayResponse = root.gateway_response ?? payload?.gateway_response ?? {}
    const payment = gatewayResponse.payment ?? root.payment ?? payload?.payment ?? {}

    return {
        gatewayToken: root.token ?? payment.token ?? payload?.token ?? null,
        trackingId: order.tracking_id ?? root.tracking_id ?? null,
        status: payment.status ?? root.status ?? payload?.status ?? gatewayResponse.status ?? null,
        uid: payment.uid ?? root.uid ?? gatewayResponse.uid ?? null,
        amountCents:
            typeof order.amount === 'number'
                ? order.amount
                : typeof root.amount === 'number'
                  ? root.amount
                  : typeof payment.amount === 'number'
                    ? payment.amount
                    : null,
        currency: order.currency ?? root.currency ?? payment.currency ?? null,
    }
}

const ensurePayloadConsistency = async (
    record: { id: string; amountCents: number; currency: string },
    details: { amountCents: number | null; currency: string | null }
) => {
    const mismatches: string[] = []
    if (details.amountCents !== null && Number(details.amountCents) !== Number(record.amountCents)) {
        mismatches.push('amount')
    }
    if (details.currency && details.currency !== record.currency) {
        mismatches.push('currency')
    }
    if (mismatches.length > 0) {
        await prisma.paymentToken.update({
            where: { id: record.id },
            data: { status: 'ERROR' },
        })
        throw new Error(`Checkout data mismatch: ${mismatches.join(', ')}`)
    }
}

const fulfillCallback = async (paymentTokenId: string) => {
    const { giftService } = await import('@/entities/gift/api/server/gift.service')
    await giftService.fulfillPaymentToken(paymentTokenId)
    const { creditService } = await import('@/entities/credit/api/server/credit.service')
    await creditService.fulfillPaymentToken(paymentTokenId)
}

const queryCheckout = async (gatewayToken: string) => {
    const url = `${API_BASE_URL}/ctp/api/checkouts/${encodeURIComponent(gatewayToken)}`
    const response = await fetch(url, { method: 'GET', headers: authHeaders() })
    if (!response.ok) {
        throw new Error(`Secure Processor reconciliation failed (${response.status})`)
    }
    const json = await response.json().catch(() => ({}))
    return extractCheckoutDetails(json)
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
        assertValidBackendUrl()

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

        const returnUrl = `${BACKEND_URL}/api/payments/secure-processor/return?token=${paymentToken.token}`

        const payload = {
            checkout: {
                version: 2.1,
                transaction_type: 'payment',
                test: isTestMode(),
                settings: {
                    return_url: returnUrl,
                    notification_url: `${BACKEND_URL}/api/payments/secure-processor/webhook`,
                },
                order: {
                    amount: params.amountCents,
                    currency: params.currency,
                    description: params.description,
                    tracking_id: paymentToken.token,
                },
                customer: { id: params.userId },
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
                    gatewayUid: resolvedToken,
                    rawPayload: (json ?? Prisma.JsonNull) as Prisma.InputJsonValue,
                    status: 'PENDING',
                },
            })
        } catch (error) {
            console.error('[secure-processor] Failed to create checkout token', error)
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

        if (!paymentToken.gatewayUid) {
            return paymentToken
        }

        // Authoritative status comes from the provider, not the redirect URL.
        const remote = await queryCheckout(paymentToken.gatewayUid)
        const nextStatus = mapSecureProcessorStatus(remote.status)

        await ensurePayloadConsistency(
            { id: paymentToken.id, amountCents: paymentToken.amountCents, currency: paymentToken.currency },
            { amountCents: remote.amountCents, currency: remote.currency }
        )

        // Idempotent: do not re-fulfill if already successful.
        if (paymentToken.status === 'SUCCESSFUL') {
            return paymentToken
        }

        const updated = await prisma.paymentToken.update({
            where: { id: paymentToken.id },
            data: {
                status: nextStatus,
                gatewayUid: remote.uid ?? paymentToken.gatewayUid,
                rawPayload: (remote as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
            },
        })

        if (nextStatus === 'SUCCESSFUL') {
            await fulfillCallback(paymentToken.id)
        }

        return updated
    },

    async processWebhook(
        payloadBuffer: Buffer,
        headers: { authorization?: string | null; contentSignature?: string | null }
    ) {
        verifyBasicAuth(headers.authorization)
        verifySignature(payloadBuffer, headers.contentSignature)

        const payload = JSON.parse(payloadBuffer.toString('utf-8')) as {
            status?: string
            uid?: string
            payment_token_id?: string
            metadata?: { payment_token_id?: string }
            checkout?: { metadata?: { payment_token_id?: string } }
        }

        const details = extractCheckoutDetails(payload)
        const tokenId =
            payload.payment_token_id ??
            payload.metadata?.payment_token_id ??
            payload.checkout?.metadata?.payment_token_id

        const paymentToken = tokenId
            ? await prisma.paymentToken.findUnique({ where: { id: tokenId } })
            : details.gatewayToken
              ? await prisma.paymentToken.findFirst({ where: { gatewayUid: details.gatewayToken } })
              : details.trackingId
                ? await prisma.paymentToken.findUnique({ where: { token: details.trackingId } })
                : null

        if (!paymentToken) {
            throw new Error('PaymentToken not found for webhook')
        }

        await ensurePayloadConsistency(
            { id: paymentToken.id, amountCents: paymentToken.amountCents, currency: paymentToken.currency },
            { amountCents: details.amountCents, currency: details.currency }
        )

        const nextStatus = mapSecureProcessorStatus(details.status)
        const shouldActivate = nextStatus === 'SUCCESSFUL' && paymentToken.status !== 'SUCCESSFUL'

        const updated = await prisma.paymentToken.update({
            where: { id: paymentToken.id },
            data: {
                status: nextStatus,
                gatewayUid: details.uid ?? paymentToken.gatewayUid,
                rawPayload: payload as unknown as Prisma.InputJsonValue,
            },
        })

        if (shouldActivate) {
            await fulfillCallback(paymentToken.id)
        }

        return updated
    },
}
