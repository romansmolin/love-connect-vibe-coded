import { BillingCadence, SubscriptionPlanName } from '../model/subscription.types'
import { selectStripeUrl } from '../utils/utils'

export const STRIPE_LINKS: Record<SubscriptionPlanName, Record<BillingCadence, string | undefined>> = {
    STARTER: {
        monthly: selectStripeUrl(
            process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_MONTHLY_URL,
            process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_MONTHLY_URL_DEV
        ),
        yearly: selectStripeUrl(
            process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_YEARLY_URL,
            process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_YEARLY_URL_DEV
        ),
    },
    PRO: {
        monthly: selectStripeUrl(
            process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_MONTHLY_URL,
            process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_MONTHLY_URL_DEV
        ),
        yearly: selectStripeUrl(
            process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_YEARLY_URL,
            process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_YEARLY_URL_DEV
        ),
    },
}
