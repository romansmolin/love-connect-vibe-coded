import { rollProbability } from './seed-roll'

const LIKE_RATE = 0.4
const MUTUAL_MATCH_RATE = 0.15

export type SeedActivityPlan = {
    createLike: boolean
    createMutualMatch: boolean
}

/**
 * Every user without visible demo activity receives a like on the next seed.
 * Once activity exists, subsequent events retain the natural 40% / 15% cadence.
 */
export const planSeedActivity = (
    hasVisibleActivity: boolean,
    roll: (rate: number) => boolean = rollProbability
): SeedActivityPlan => ({
    createLike: !hasVisibleActivity || roll(LIKE_RATE),
    createMutualMatch: roll(MUTUAL_MATCH_RATE),
})
