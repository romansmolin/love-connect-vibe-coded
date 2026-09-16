import { inject, injectable } from 'inversify'
import type { IPaymentTokenRepository } from '../interfaces/payment-token-repository.interface'
import type { PaymentGatewayAdapter } from '../interfaces/payment-gateway.interface'
import type { PaymentToken } from '../../../model/types'
import { isSecureProcessorTestMode } from '../adapters/secure-processor.adapter'
import { secureProcessorConfig } from '@/shared/config/secure-processor.config'

export type CreatePaymentCheckoutInput = {
    userId: string
    amountCents: number
    currency: string
    description: string
    customerEmail?: string
    metadata: Record<string, string>
}

export type CreatePaymentCheckoutResult = {
    checkoutToken: string
    redirectUrl?: string
    paymentToken: PaymentToken
}

const buildTrackingId = (userId: string): string => {
    const rand = crypto.randomUUID().slice(0, 8)
    return `${userId}-${Date.now()}-${rand}`
}

@injectable()
export class CreatePaymentCheckoutUseCase {
    constructor(
        @inject('IPaymentTokenRepository') private paymentTokenRepo: IPaymentTokenRepository,
        @inject('PaymentGatewayAdapter') private paymentGateway: PaymentGatewayAdapter,
    ) {}

    async execute(input: CreatePaymentCheckoutInput): Promise<CreatePaymentCheckoutResult> {
        const trackingId = buildTrackingId(input.userId)

        const paymentToken = await this.paymentTokenRepo.create({
            userId: input.userId,
            status: 'CREATED',
            amountCents: input.amountCents,
            currency: input.currency,
            trackingId,
        })

        const metadata = {
            ...input.metadata,
            payment_token_id: paymentToken.id,
            user_id: input.userId,
        }

        const returnUrl = new URL(
            '/api/payments/secure-processor/return',
            secureProcessorConfig.backendBaseUrl,
        )
        returnUrl.searchParams.set('token', paymentToken.id)

        const notificationUrl = new URL(
            '/api/payments/secure-processor/webhook',
            secureProcessorConfig.backendBaseUrl,
        )

        const checkout = await this.paymentGateway.createCheckout({
            amountCents: input.amountCents,
            currency: input.currency,
            description: input.description,
            returnUrl: returnUrl.toString(),
            notificationUrl: notificationUrl.toString(),
            trackingId,
            customerId: input.userId,
            customerEmail: input.customerEmail,
            testMode: isSecureProcessorTestMode(),
            metadata,
        })

        const updated = await this.paymentTokenRepo.update(paymentToken.id, {
            status: 'PENDING',
            gatewayToken: checkout.checkoutToken,
            rawPayload: checkout.rawPayload,
        })

        return {
            checkoutToken: checkout.checkoutToken,
            redirectUrl: checkout.redirectUrl,
            paymentToken: updated,
        }
    }
}
