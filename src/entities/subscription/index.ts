import type { BillingCadence, SubscriptionPlanName } from './model/types'

export { subscriptionApi, useCancelSubscriptionMutation, useUpdateUserPlanMutation } from './api/client/subscription.api'
export type {
    BillingCadence,
    BillingOption,
    CancelSubscriptionResponse,
    PlanOption,
    SubscriptionPlanName,
    UpdateSubscriptionRequest,
    UpdateSubscriptionResponse,
} from './model/types'

export const STRIPE_LINKS: Record<SubscriptionPlanName, Partial<Record<BillingCadence, string>>> = {
    STARTER: {},
    PRO: {},
}
