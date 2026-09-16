import 'server-only'
import { inject, injectable } from 'inversify'
import crypto from 'node:crypto'
import { prisma } from '@/shared/lib/database/prisma'
import type { IPaymentTokenRepository } from '../interfaces/payment-token-repository.interface'
import type { ICreditRepository } from '@/entities/credit/api/server/interfaces/credit-repository.interface'
import { AppError } from '@/shared/errors/app-error'
import type { PaymentToken, PaymentTokenStatus } from '../../../model/types'
import type { IUserRepository } from '@/entities/user/api/server/interfaces/user-repository.interface'
import { DI_TOKENS } from '@/shared/lib/di/tokens'
import { sendPaymentSuccessEmail } from '@/shared/lib/email/mailer'
import { secureProcessorConfig } from '@/shared/config/secure-processor.config'
import { normalizeGatewayStatus, extractCheckoutDetails } from './checkout-payload'

type HandleWebhookInput = {
    rawBody: Buffer
    authorization?: string | null
    contentSignature?: string | null
}

const verifyBasicAuth = (authorization?: string | null) => {
    if (!authorization?.startsWith('Basic ')) {
        throw AppError.authorizationError('Webhook authorization header is missing')
    }

    const provided = Buffer.from(authorization.slice('Basic '.length).trim())
    const expected = Buffer.from(secureProcessorConfig.authHeader.slice('Basic '.length))

    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
        throw AppError.authorizationError('Webhook authorization failed')
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

const verifySignature = (rawBody: Buffer, header?: string | null) => {
    if (!header) {
        throw AppError.authorizationError('Content-Signature header is missing')
    }

    const signature = extractSignature(header)
    const isValid = crypto.verify(
        'RSA-SHA256',
        rawBody,
        secureProcessorConfig.publicKey,
        Buffer.from(signature, 'base64'),
    )

    if (!isValid) {
        throw AppError.authorizationError('Invalid webhook signature')
    }
}

const shouldFailTransaction = (status: PaymentTokenStatus) => {
    return ['FAILED', 'DECLINED', 'EXPIRED', 'ERROR'].includes(status)
}

@injectable()
export class HandlePaymentWebhookUseCase {
    constructor(
        @inject('IPaymentTokenRepository') private paymentTokenRepo: IPaymentTokenRepository,
        @inject('ICreditRepository') private creditRepo: ICreditRepository,
        @inject(DI_TOKENS.UserRepository) private userRepo: IUserRepository,
    ) {}

    async execute(input: HandleWebhookInput) {
        verifyBasicAuth(input.authorization)
        verifySignature(input.rawBody, input.contentSignature)

        let payload: any
        try {
            payload = JSON.parse(input.rawBody.toString('utf-8'))
        } catch {
            throw AppError.validationError('Webhook payload is not valid JSON')
        }

        const details = extractCheckoutDetails(payload)
        const status = normalizeGatewayStatus(details.status)

        const paymentToken = await this.resolveRecord(details, payload)

        this.ensurePayloadConsistency(paymentToken, details)

        return this.applyStatus(paymentToken, status, {
            gatewayUid: details.uid ?? paymentToken.gatewayUid,
            rawPayload: payload,
        })
    }

    private async resolveRecord(
        details: ReturnType<typeof extractCheckoutDetails>,
        payload: any,
    ): Promise<PaymentToken> {
        const internalId =
            payload?.payment_token_id ??
            payload?.metadata?.payment_token_id ??
            payload?.checkout?.metadata?.payment_token_id ??
            null

        if (internalId) {
            const byId = await this.paymentTokenRepo.findById(internalId)
            if (byId) return byId
        }

        if (details.gatewayToken) {
            const byGatewayToken = await this.paymentTokenRepo.findByGatewayToken(details.gatewayToken)
            if (byGatewayToken) return byGatewayToken
        }

        if (details.trackingId) {
            const byTracking = await this.paymentTokenRepo.findByTrackingId(details.trackingId)
            if (byTracking) return byTracking
        }

        if (details.uid) {
            const byUid = await this.paymentTokenRepo.findByGatewayUid(details.uid)
            if (byUid) return byUid
        }

        throw AppError.notFoundError('Payment record not found for webhook')
    }

    private ensurePayloadConsistency(
        record: PaymentToken,
        details: ReturnType<typeof extractCheckoutDetails>,
    ) {
        const mismatches: string[] = []
        if (details.amountCents !== null && Number(details.amountCents) !== Number(record.amountCents)) {
            mismatches.push('amount')
        }
        if (details.currency && details.currency !== record.currency) {
            mismatches.push('currency')
        }
        if (mismatches.length > 0) {
            const message = `Checkout data mismatch: ${mismatches.join(', ')}`
            this.paymentTokenRepo
                .update(record.id, {
                    status: 'ERROR',
                    errorMessage: message,
                    rawPayload: details.rawPayload,
                })
                .catch(() => {})
            throw AppError.validationError(message)
        }
    }

    private async applyStatus(
        record: PaymentToken,
        nextStatus: PaymentTokenStatus,
        updates: { gatewayUid?: string | null; rawPayload?: unknown },
    ) {
        return await prisma.$transaction(async (tx) => {
            const shouldActivate = nextStatus === 'SUCCESSFUL' && record.status !== 'SUCCESSFUL'
            const shouldFail = shouldFailTransaction(nextStatus) && record.status !== 'SUCCESSFUL'

            await tx.payment_token.update({
                where: { id: record.id },
                data: {
                    status: nextStatus,
                    gatewayUid: updates.gatewayUid ?? undefined,
                    rawPayload: (updates.rawPayload ?? undefined) as any,
                    updatedAt: new Date(),
                },
            })

            const transaction = await tx.credit_transaction.findUnique({
                where: { paymentTokenId: record.id },
            })

            if (!transaction) {
                throw AppError.notFoundError('Credit transaction not found')
            }

            if (shouldActivate) {
                if (transaction.status === 'SUCCESSFUL') {
                    return { paymentTokenId: record.id, transactionId: transaction.id, fulfilled: false }
                }

                const balanceRow = await tx.user_credits.upsert({
                    where: { userId: transaction.userId },
                    update: { balance: { increment: transaction.amount } },
                    create: { userId: transaction.userId, balance: transaction.amount },
                })

                await tx.credit_transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'SUCCESSFUL' },
                })

                return {
                    paymentTokenId: record.id,
                    transactionId: transaction.id,
                    fulfilled: true,
                    newBalance: balanceRow.balance,
                    creditAmount: transaction.amount,
                    userId: transaction.userId,
                }
            }

            if (shouldFail) {
                await tx.credit_transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'FAILED' },
                })
            }

            return { paymentTokenId: record.id, transactionId: transaction.id, fulfilled: false }
        }).then(async (result) => {
            if (result.fulfilled && result.userId) {
                const user = await this.userRepo.findById(result.userId)
                if (user?.email) {
                    await sendPaymentSuccessEmail({
                        email: user.email,
                        credits: result.creditAmount ?? 0,
                    }).catch((error) => {
                        console.error('[HandlePaymentWebhookUseCase] Failed to send success email', error)
                    })
                }
            }

            return result
        })
    }
}
