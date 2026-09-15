export const rollProbability = (rate: number, rng: () => number = Math.random): boolean => rng() < rate
