const MIN_DELAY_MS = 30_000
const MAX_DELAY_MS = 5 * 60_000

export const randomReplyDelayMs = (rng: () => number = Math.random): number =>
    Math.floor(MIN_DELAY_MS + rng() * (MAX_DELAY_MS - MIN_DELAY_MS))
