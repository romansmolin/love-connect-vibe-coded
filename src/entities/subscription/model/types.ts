export type SubscriptionPlanName = 'STARTER' | 'PRO'

export type BillingCadence = 'monthly' | 'yearly'

export interface PlanOption {
    value: SubscriptionPlanName
    title: string
    description: string
    highlights: string[]
}

export interface BillingOption {
    value: BillingCadence
    title: string
    description: string
    savings?: string
}

export interface UpdateSubscriptionRequest {
    planName: SubscriptionPlanName
    planType?: BillingCadence
}

export interface UpdateSubscriptionResponse {
    success: boolean
    message?: string
}

export interface CancelSubscriptionResponse {
    success: boolean
    message?: string
}
