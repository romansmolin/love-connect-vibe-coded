export type GiftStatus = 'ACTIVE' | 'ARCHIVED'

export interface Gift {
    id: string
    name: string
    emoji: string
    priceCents: number
    currency: string
    status: GiftStatus
    createdAt: Date
    updatedAt: Date
}

export type GiftTransactionStatus =
    | 'CREATED'
    | 'PAYMENT_PENDING'
    | 'PAYMENT_FAILED'
    | 'AVAILABLE'
    | 'DELIVERED'
    | 'CANCELLED'

export interface GiftTransaction {
    id: string
    giftId: string
    senderId: string
    recipientId?: string | null
    matchId?: string | null
    paymentTokenId: string
    status: GiftTransactionStatus
    amountCents: number
    currency: string
    gatewayUid?: string | null
    rawPayload?: unknown
    createdAt: Date
    deliveredAt?: Date | null
}

export interface GiftInventoryItem {
    id: string
    gift: Gift
    status: GiftTransactionStatus
    createdAt: string
    deliveredAt?: string | null
}

export interface GiftCatalogResponse {
    items: Gift[]
}

export interface GiftInventoryResponse {
    items: GiftInventoryItem[]
    total: number
}

export interface PurchaseGiftRequest {
    giftId: string
}

export interface PurchaseGiftResponse {
    transactionId: string
    paymentToken: string
    checkoutToken?: string
    status: GiftTransactionStatus
}

export interface SendGiftRequest {
    transactionId: string
    recipientId: string | number
}

export interface SendGiftResponse {
    transactionId: string
    status: GiftTransactionStatus
}
