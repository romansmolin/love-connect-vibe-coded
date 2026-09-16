import 'server-only'
import { inject, injectable } from 'inversify'
import { prisma } from '@/shared/lib/database/prisma'
import type { IPaymentTokenRepository } from '../interfaces/payment-token-repository.interface'
import type { PaymentGatewayAdapter } from '../interfaces/payment-gateway.interface'
import type { PaymentToken, PaymentTokenStatus } from '../../../model/types'
import { AppError } from '@/shared/errors/app-error'
import { secureProcessorConfig } from '@/shared/config/secure-processor.config'
import { normalizeGatewayStatus } from './checkout-payload'

export type HandleReturnInput = {
    paymentTokenId: string
    statusHint?: string | null
    uidHint?: string | null
}

export type HandleReturnResult = {
    status: PaymentTokenStatus
    redirectUrl: string
}

const shouldFailTransaction = (status: PaymentTokenStatus) =>
    ['FAILED', 'DECLINED', 'EXPIRED', 'ERROR'].includes(status)

const buildRedirectUrl = (status: PaymentTokenStatus, paymentTokenId: string): string => {
    let destination: 'success' | 'pending' | 'failed'
    if (status === 'SUCCESSFUL') destination = 'success'
    else if (status === 'PENDING') destination = 'pending'
    else destination = 'failed'

    const params = new URLSearchParams({ status: status.toLowerCase(), token: paymentTokenId })
    return `${secureProcessorConfig.frontendBaseUrl}/payments/secure-processor/${destination}?${params.toString()}`
}

@injectable()
export class HandleReturnUseCase {
    constructor(
        @inject('IPaymentTokenRepository') private paymentTokenRepo: IPaymentTokenRepository,
        @inject('PaymentGatewayAdapter') private paymentGateway: PaymentGatewayAdapter,
    ) {}

    async execute(input: HandleReturnInput): Promise<HandleReturnResult> {
        const record = await this.paymentTokenRepo.findById(input.paymentTokenId)
        if (!record) {
            throw AppError.notFoundError('Payment token not found')
        }

        // Always reconcile with the provider. The query string is untrusted.
        if (!record.gatewayToken) {
            return { status: record.status, redirectUrl: buildRedirectUrl(record.status, record.id) }
        }

        const remote = await this.paymentGateway.queryCheckout(record.gatewayToken)
        const nextStatus = normalizeGatewayStatus(remote.status)

        this.ensurePayloadConsistency(record, remote)

        const fulfilled = await this.applyStatus(record, nextStatus, {
            gatewayUid: remote.uid ?? record.gatewayUid,
            rawPayload: remote.rawPayload,
        })

        return {
            status: nextStatus,
            redirectUrl: buildRedirectUrl(nextStatus, record.id),
        }
    }

    private ensurePayloadConsistency(
        record: PaymentToken,
        remote: { amountCents: number | null; currency: string | null; rawPayload: unknown },
    ) {
        const mismatches: string[] = []
        if (remote.amountCents !== null && Number(remote.amountCents) !== Number(record.amountCents)) {
            mismatches.push('amount')
        }
        if (remote.currency && remote.currency !== record.currency) {
            mismatches.push('currency')
        }
        if (mismatches.length > 0) {
            const message = `Checkout data mismatch: ${mismatches.join(', ')}`
            this.paymentTokenRepo
                .update(record.id, {
                    status: 'ERROR',
                    errorMessage: message,
                    rawPayload: remote.rawPayload,
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

            if (!transaction) return false

            if (shouldActivate && transaction.status !== 'SUCCESSFUL') {
                await tx.user_credits.upsert({
                    where: { userId: transaction.userId },
                    update: { balance: { increment: transaction.amount } },
                    create: { userId: transaction.userId, balance: transaction.amount },
                })
                await tx.credit_transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'SUCCESSFUL' },
                })
                return true
            }

            if (shouldFail && transaction.status !== 'SUCCESSFUL') {
                await tx.credit_transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'FAILED' },
                })
            }

            return false
        })
    }
}
