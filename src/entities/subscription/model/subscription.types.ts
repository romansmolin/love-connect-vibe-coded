export type SubscriptionPlanName = 'PRO' | 'STARTER'
export type BillingCadence = 'monthly' | 'yearly'

export type PlanOption = {
    value: SubscriptionPlanName
    title: string
    description: string
    highlights: string[]
}

export type BillingOption = {
    value: BillingCadence
    title: string
    description: string
    savings?: string
}
