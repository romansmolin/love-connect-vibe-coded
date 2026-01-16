'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { TOKEN_COOKIE_NAME, TOKEN_EXPIRY_STORAGE_KEY } from '@/shared/lib/auth/session'
import { cn } from '@/shared/lib/utils'
import AnimatedContent from '@/shared/ui/AnimatedContent'
import { AnimatedShinyText } from '@/shared/ui/animated-shiny-text'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import { PricingCard, PricingPlan } from './pricing-card'

const tooltipContent = {
    connectedAccounts: 'Maximum number of social profiles you can connect across all platforms.',
    multiPerPlatform: 'Link multiple accounts from the same platform (e.g., 3 Instagram profiles).',
    postLimit: 'Maximum number of posts you can publish to social platforms each month.',
    unlimitedPosts: 'No monthly limit on published posts. Post as often as you like.',
    scheduling: 'Number of posts you can have queued and scheduled ahead of time.',
    carousels: 'Create and schedule multi-image or carousel posts where supported (e.g., Instagram).',
    aiCaptions: 'Generate caption ideas with AI to speed up your content creation.',
    drafts: 'Save posts as drafts and reuse your best content anytime.',
    support: 'Standard support via chat or email during working hours.',
    prioritySupport: 'Priority support with the fastest response times.',
    whiteLabel: 'Add your own branding and logo for a professional white-label experience.',
    teamAccess: 'Invite teammates to collaborate with separate logins and shared access.',
}

// Match/beat competitor’s yearly deal
export const YEARLY_DISCOUNT = 40 // 40% off yearly

const isDevelopment = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'

const resolveStripeLink = (production: string | undefined, development: string | undefined) => {
    return isDevelopment ? (development ?? production) : production
}

export const plans: PricingPlan[] = [
    {
        name: 'Starter',
        price: 10,
        description: 'For beginner creators and others managing up to 10 profiles.',
        isPopular: true,
        features: [
            { title: 'Up to 10 connected social accounts', tooltip: tooltipContent.connectedAccounts },
            { title: '1000 posts per month', tooltip: tooltipContent.postLimit },
            { title: 'Schedule up to 500 posts ahead', tooltip: tooltipContent.scheduling },
            { title: 'Carousel posts', tooltip: tooltipContent.carousels },
            { title: 'Multi-platform publishing', tooltip: tooltipContent.multiPerPlatform },
            { title: 'Standard support', tooltip: tooltipContent.support },
        ],
        stripeMonthlyLink: resolveStripeLink(
            process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_MONTHLY_URL,
            process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_MONTHLY_URL_DEV
        ),
        stripeYearlyLink: resolveStripeLink(
            process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_YEARLY_URL,
            process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_YEARLY_URL_DEV
        ),
    },
    {
        name: 'Pro',
        price: 17,
        description: 'For teams and brands scaling content with high volume.',
        features: [
            { title: '30 connected accounts', tooltip: tooltipContent.connectedAccounts },
            { title: 'Up to 2000 posts per month', tooltip: tooltipContent.postLimit },
            { title: 'Schedule up to 1000 posts ahead', tooltip: tooltipContent.scheduling },
            { title: 'Carousel for specific social medias', tooltip: tooltipContent.carousels },
            { title: 'Multi-platform publishing', tooltip: tooltipContent.multiPerPlatform },
            { title: 'AI caption assistant (500 requests/month)', tooltip: tooltipContent.aiCaptions },
            // { title: 'White-label branding option', tooltip: tooltipContent.whiteLabel },
            { title: 'Priority human support', tooltip: tooltipContent.prioritySupport },
        ],
        stripeMonthlyLink: resolveStripeLink(
            process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_MONTHLY_URL,
            process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_MONTHLY_URL_DEV
        ),
        stripeYearlyLink: resolveStripeLink(
            process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_YEARLY_URL,
            process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_YEARLY_URL_DEV
        ),
    },
]

const onPriceClick = (stripeLink: string) => {
    sessionStorage.setItem('stripeLink', stripeLink)
}

const hasStoredAuthToken = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return false
    }

    const hasExpiry = Boolean(window.localStorage?.getItem(TOKEN_EXPIRY_STORAGE_KEY))
    const hasCookie = document.cookie
        .split(';')
        .map((cookie) => cookie.trim())
        .some((cookie) => cookie.startsWith(`${TOKEN_COOKIE_NAME}=`))

    return hasExpiry || hasCookie
}

const PricingSection = () => {
    const [selectedBillingPeriod, setSelectedBillingPeriod] = useState('monthly')
    const [hasAuthToken, setHasAuthToken] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const updateAuthTokenState = () => {
            setHasAuthToken(hasStoredAuthToken())
        }

        updateAuthTokenState()

        if (typeof window === 'undefined') {
            return
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === TOKEN_EXPIRY_STORAGE_KEY) {
                updateAuthTokenState()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    const handlePlanSelect = (plan: PricingPlan) => {
        const paymentLink = selectedBillingPeriod === 'monthly' ? plan.stripeMonthlyLink : plan.stripeYearlyLink

        if (hasAuthToken && paymentLink) {
            window.location.href = paymentLink
            return
        }

        if (!hasAuthToken && paymentLink) {
            onPriceClick(paymentLink)
        }

        router.push('/auth')
    }

    return (
        <div className=" flex flex-col items-center py-10 md:py-14 justify-center px-5" id="pricing">
            <h1 className="text-5xl font-bold text-center tracking-tight">Pricing</h1>

            <div className="z-10 flex items-center justify-center mt-5">
                <div
                    className={cn(
                        'group rounded-full border border-primary/10 text-base text-primary transition-all ease-in hover:cursor-pointer hover:bg-primary/0 dark:border-white/5 dark:bg-primary-900 dark:hover:bg-primary/10'
                    )}
                >
                    <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-primary/70 hover:duration-300">
                        <span>✨ Early Adopters Places 0/150 ✨</span>
                    </AnimatedShinyText>
                </div>
            </div>

            <Tabs
                aria-label="Select billing cadence"
                className="mt-8"
                value={selectedBillingPeriod}
                onValueChange={setSelectedBillingPeriod}
            >
                <TabsList className="h-11 bg-background border !p-0">
                    <TabsTrigger
                        className="px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        value="monthly"
                    >
                        Monthly
                    </TabsTrigger>
                    <TabsTrigger
                        className="px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        value="yearly"
                    >
                        Yearly (Save {YEARLY_DISCOUNT}%)
                    </TabsTrigger>
                </TabsList>
                <TabsContent className="sr-only" value="monthly">
                    Monthly billing plan selected.
                </TabsContent>
                <TabsContent className="sr-only" value="yearly">
                    Yearly billing plan selected.
                </TabsContent>
            </Tabs>

            <div className="mt-12 mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-2">
                {plans.map((plan) => (
                    <AnimatedContent key={plan.name} direction="horizontal">
                        <PricingCard
                            plan={plan}
                            selectedBillingPeriod={selectedBillingPeriod as 'monthly' | 'yearly'}
                            yearlyDiscount={YEARLY_DISCOUNT}
                            onSelect={handlePlanSelect}
                        />
                    </AnimatedContent>
                ))}
            </div>
        </div>
    )
}

export default PricingSection
