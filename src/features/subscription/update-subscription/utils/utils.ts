import { BillingCadence, SubscriptionPlanName } from '@/entities/subscription'

export const normalizePlanType = (planType?: string | null): BillingCadence | null => {
    if (!planType) return null
    const normalized = planType.trim().toLowerCase()
    return normalized === 'monthly' || normalized === 'yearly' ? (normalized as BillingCadence) : null
}

export const normalizePlanName = (planName?: string | null): SubscriptionPlanName | null => {
    if (!planName) return null

    const normalized = planName.trim().toUpperCase()
    return normalized === 'PRO' || normalized === 'STARTER' ? (normalized as SubscriptionPlanName) : null
}

export const appendClientReferenceId = (checkoutLink: string, clientReferenceId: string) => {
    try {
        const url = new URL(checkoutLink)
        url.searchParams.set('client_reference_id', clientReferenceId)
        return url.toString()
    } catch {
        return checkoutLink
    }
}
