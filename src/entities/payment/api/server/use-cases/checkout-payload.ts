import 'server-only'
import type { PaymentTokenStatus } from '../../../model/types'

export const normalizeGatewayStatus = (status?: string | null): PaymentTokenStatus => {
    if (!status) return 'PENDING'

    const normalized = status.toLowerCase()

    if (['success', 'successful', 'paid', 'approved'].includes(normalized)) return 'SUCCESSFUL'
    if (['pending', 'processing', 'incomplete', 'awaiting'].includes(normalized)) return 'PENDING'
    if (['declined', 'canceled', 'cancelled'].includes(normalized)) return 'DECLINED'
    if (['failed', 'error'].includes(normalized)) return 'FAILED'
    if (normalized === 'expired') return 'EXPIRED'

    return 'PENDING'
}

export type CheckoutDetails = {
    gatewayToken: string | null
    trackingId: string | null
    status: string | null
    uid: string | null
    amountCents: number | null
    currency: string | null
    testMode: boolean | null
    rawPayload: unknown
}

export const extractCheckoutDetails = (payload: any): CheckoutDetails => {
    const checkout = payload?.checkout ?? {}
    const transaction = payload?.transaction ?? {}
    const root =
        Object.keys(checkout).length > 0
            ? checkout
            : Object.keys(transaction).length > 0
              ? transaction
              : payload ?? {}
    const order = root.order ?? payload?.order ?? {}
    const gatewayResponse = root.gateway_response ?? payload?.gateway_response ?? {}
    const payment = gatewayResponse.payment ?? root.payment ?? payload?.payment ?? {}
    const additionalData = root.additional_data ?? payload?.additional_data ?? {}
    const vendor = additionalData.vendor ?? {}

    const gatewayToken =
        root.token ?? payment.token ?? payload?.token ?? vendor.token ?? null
    const trackingId =
        root.tracking_id ??
        order.tracking_id ??
        payment.tracking_id ??
        gatewayResponse.tracking_id ??
        payload?.tracking_id ??
        null
    const status = payment.status ?? root.status ?? payload?.status ?? gatewayResponse.status ?? null
    const uid = payment.uid ?? root.uid ?? gatewayResponse.uid ?? payload?.uid ?? null
    const amountCents =
        typeof order.amount === 'number'
            ? order.amount
            : typeof root.amount === 'number'
              ? root.amount
              : typeof payment.amount === 'number'
                ? payment.amount
                : null
    const currency = order.currency ?? root.currency ?? payment.currency ?? null
    const testMode = Boolean(
        root.test ?? gatewayResponse.test ?? payment.test ?? checkout.settings?.test ?? null,
    )

    return {
        gatewayToken,
        trackingId,
        status,
        uid,
        amountCents,
        currency,
        testMode,
        rawPayload: payload,
    }
}
