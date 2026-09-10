import { centsFromCredits } from '@/shared/lib/credits'

export const CREDIT_PACKAGES = [
    {
        id: '100-credits',
        credits: 100,
        amountCents: centsFromCredits(100),
        label: '100 credit pack',
    },
    {
        id: '250-credits',
        credits: 250,
        amountCents: centsFromCredits(250),
        label: '250 credit pack',
    },
    {
        id: '500-credits',
        credits: 500,
        amountCents: centsFromCredits(500),
        label: '500 credit pack',
    },
] as const

export const CREDIT_PACKAGE_CREDITS = CREDIT_PACKAGES.map((pack) => pack.credits)

export const isCreditPackage = (credits: number): boolean =>
    CREDIT_PACKAGE_CREDITS.some((value) => value === credits)
