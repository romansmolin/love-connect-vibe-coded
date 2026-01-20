export type PaymentTokenStatus =
    | 'CREATED'
    | 'PENDING'
    | 'SUCCESSFUL'
    | 'FAILED'
    | 'DECLINED'
    | 'EXPIRED'
    | 'ERROR'

export interface PaymentToken {
    id: string
    token: string
    userId: string
    itemType: string
    description?: string | null
    amountCents: number
    currency: string
    status: PaymentTokenStatus
    testMode: boolean
    gatewayUid?: string | null
    rawPayload?: unknown
    createdAt: Date
    updatedAt: Date
}
