export interface CreateCheckoutInput {
    amountCents: number
    currency: string
    description: string
    returnUrl: string
    notificationUrl?: string
    trackingId: string
    customerId: string
    customerEmail?: string
    testMode: boolean
    metadata: Record<string, string>
}

export interface CreateCheckoutResult {
    checkoutToken: string
    redirectUrl?: string
    rawPayload: unknown
}

export interface QueryCheckoutResult {
    status: string | null
    uid: string | null
    amountCents: number | null
    currency: string | null
    trackingId: string | null
    testMode: boolean | null
    rawPayload: unknown
}

export interface PaymentGatewayAdapter {
    createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>
    queryCheckout(gatewayCheckoutToken: string): Promise<QueryCheckoutResult>
}
