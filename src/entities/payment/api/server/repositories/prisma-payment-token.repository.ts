import { injectable } from 'inversify'
import { prisma } from '@/shared/lib/database/prisma'
import type { IPaymentTokenRepository } from '../interfaces/payment-token-repository.interface'
import type {
    PaymentToken,
    CreatePaymentTokenInput,
    UpdatePaymentTokenInput,
} from '../../../model/types'

type PaymentTokenRow = NonNullable<Awaited<ReturnType<typeof prisma.payment_token.findUnique>>>
type PaymentTokenRawPayloadInput = Exclude<
    Parameters<typeof prisma.payment_token.create>[0]['data']['rawPayload'],
    null | undefined
>

const toJsonValue = (value: unknown | null | undefined): PaymentTokenRawPayloadInput | undefined => {
    if (value === undefined || value === null) return undefined
    return value as PaymentTokenRawPayloadInput
}

@injectable()
export class PrismaPaymentTokenRepository implements IPaymentTokenRepository {
    async create(input: CreatePaymentTokenInput): Promise<PaymentToken> {
        const token = await prisma.payment_token.create({
            data: {
                id: crypto.randomUUID(),
                userId: input.userId,
                status: input.status,
                gatewayUid: input.gatewayUid ?? null,
                gatewayToken: input.gatewayToken ?? null,
                trackingId: input.trackingId,
                rawPayload: toJsonValue(input.rawPayload),
                amountCents: input.amountCents,
                currency: input.currency,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        })

        return this.mapToPaymentToken(token)
    }

    async update(id: string, input: UpdatePaymentTokenInput): Promise<PaymentToken> {
        const token = await prisma.payment_token.update({
            where: { id },
            data: {
                status: input.status,
                gatewayUid: input.gatewayUid ?? undefined,
                gatewayToken: input.gatewayToken ?? undefined,
                rawPayload: toJsonValue(input.rawPayload),
                errorMessage: input.errorMessage ?? undefined,
                updatedAt: new Date(),
            },
        })

        return this.mapToPaymentToken(token)
    }

    async findById(id: string): Promise<PaymentToken | null> {
        const token = await prisma.payment_token.findUnique({
            where: { id },
        })

        return token ? this.mapToPaymentToken(token) : null
    }

    async findByGatewayUid(gatewayUid: string): Promise<PaymentToken | null> {
        const token = await prisma.payment_token.findUnique({
            where: { gatewayUid },
        })

        return token ? this.mapToPaymentToken(token) : null
    }

    async findByGatewayToken(gatewayToken: string): Promise<PaymentToken | null> {
        const token = await prisma.payment_token.findUnique({
            where: { gatewayToken },
        })

        return token ? this.mapToPaymentToken(token) : null
    }

    async findByTrackingId(trackingId: string): Promise<PaymentToken | null> {
        const token = await prisma.payment_token.findUnique({
            where: { trackingId },
        })

        return token ? this.mapToPaymentToken(token) : null
    }

    private mapToPaymentToken(data: PaymentTokenRow): PaymentToken {
        return {
            id: data.id,
            userId: data.userId,
            status: data.status,
            gatewayUid: data.gatewayUid,
            gatewayToken: data.gatewayToken,
            trackingId: data.trackingId,
            rawPayload: data.rawPayload,
            errorMessage: data.errorMessage,
            amountCents: data.amountCents,
            currency: data.currency,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        }
    }
}
