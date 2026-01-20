const CENTS_PER_CREDIT = 2

export const creditsFromCents = (amountCents: number) => Math.round(amountCents / CENTS_PER_CREDIT)

export const centsFromCredits = (credits: number) => credits * CENTS_PER_CREDIT

export const formatCredits = (credits: number) => `${credits} credits`

export { CENTS_PER_CREDIT }
