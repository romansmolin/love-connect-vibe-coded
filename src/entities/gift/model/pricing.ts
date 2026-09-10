export const GIFT_PRICE_CREDITS = [10, 30, 50, 100, 150, 250, 350, 500] as const

export type GiftPriceCredits = (typeof GIFT_PRICE_CREDITS)[number]
