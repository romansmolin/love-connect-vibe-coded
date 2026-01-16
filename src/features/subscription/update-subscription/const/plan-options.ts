import { BillingOption, PlanOption } from '@/entities/subscription'

export const PLAN_OPTIONS: PlanOption[] = [
    {
        value: 'STARTER',
        title: 'Starter',
        description: 'Essential scheduling toolkit for creators validating EasyPost.',
        highlights: ['Multi-platform scheduling', 'Unified calendar view', 'Community support'],
    },
    {
        value: 'PRO',
        title: 'Pro',
        description: 'Advanced automation, higher limits, and priority support for teams.',
        highlights: ['Higher posting limits', 'Advanced collaboration tools', 'Priority support'],
    },
]

export const BILLING_OPTIONS: BillingOption[] = [
    {
        value: 'monthly',
        title: 'Monthly billing',
        description: 'Pay as you go, month to month.',
    },
    {
        value: 'yearly',
        title: 'Yearly billing',
        description: 'Prepay for the year and unlock better savings.',
        savings: 'Save up to 20%',
    },
]
