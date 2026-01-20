export type CreditTransactionStatus = 'CREATED' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED'
export type CreditTransactionType = 'PURCHASE' | 'SPEND' | 'ADJUSTMENT'

export type CreditTransaction = {
    id: string
    walletId: string
    userId: string
    paymentTokenId?: string | null
    type: CreditTransactionType
    status: CreditTransactionStatus
    credits: number
    amountCents: number
    currency: string
    description?: string | null
    createdAt: string
    updatedAt: string
}

export type CreditWalletSummary = {
    balance: number
    currency: string
    totalPurchased: number
    totalSpent: number
    pendingCredits: number
}

export type CreditWalletResponse = {
    wallet: CreditWalletSummary
    transactions: CreditTransaction[]
    total: number
}

export type PurchaseCreditsRequest = {
    credits: number
}

export type PurchaseCreditsResponse = {
    transactionId: string
    paymentToken: string
    checkoutToken: string | null
    status: CreditTransactionStatus
    credits: number
    amountCents: number
    currency: string
}
