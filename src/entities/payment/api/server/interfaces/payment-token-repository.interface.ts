import type { PaymentToken, CreatePaymentTokenInput, UpdatePaymentTokenInput } from '../../../model/types'

export interface IPaymentTokenRepository {
    create(input: CreatePaymentTokenInput): Promise<PaymentToken>
    update(id: string, input: UpdatePaymentTokenInput): Promise<PaymentToken>
    findById(id: string): Promise<PaymentToken | null>
    findByGatewayUid(gatewayUid: string): Promise<PaymentToken | null>
    findByGatewayToken(gatewayToken: string): Promise<PaymentToken | null>
    findByTrackingId(trackingId: string): Promise<PaymentToken | null>
}
