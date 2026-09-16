import type { RelationshipGoal } from '@/entities/user/model/questionnaire-types'

export const RELATIONSHIP_GOALS: Array<{ slug: RelationshipGoal; label: string }> = [
    { slug: 'serious', label: 'Serious relationship' },
    { slug: 'casual', label: 'Casual dating' },
    { slug: 'friendship', label: 'Friendship first' },
    { slug: 'open', label: 'Open to anything' },
    { slug: 'unsure', label: 'Still figuring it out' },
]

export const INTERESTS_OPTIONS: Array<{ slug: string; label: string }> = [
    { slug: 'travel', label: 'Travel' },
    { slug: 'music', label: 'Music' },
    { slug: 'movies', label: 'Movies' },
    { slug: 'food', label: 'Food' },
    { slug: 'fitness', label: 'Fitness' },
    { slug: 'outdoors', label: 'Outdoors' },
    { slug: 'reading', label: 'Reading' },
    { slug: 'art', label: 'Art' },
    { slug: 'gaming', label: 'Gaming' },
    { slug: 'tech', label: 'Tech' },
    { slug: 'pets', label: 'Pets' },
    { slug: 'cooking', label: 'Cooking' },
    { slug: 'dancing', label: 'Dancing' },
    { slug: 'photography', label: 'Photography' },
    { slug: 'fashion', label: 'Fashion' },
    { slug: 'sports', label: 'Sports' },
]

export const LIFESTYLE_OPTIONS: Array<{ slug: string; label: string }> = [
    { slug: 'non_smoker', label: 'Non-smoker' },
    { slug: 'social_drinker', label: 'Social drinker' },
    { slug: 'sober', label: 'Sober' },
    { slug: 'active', label: 'Active / works out' },
    { slug: 'homebody', label: 'Homebody' },
    { slug: 'social_butterfly', label: 'Social butterfly' },
    { slug: 'wants_kids', label: 'Wants kids' },
    { slug: 'has_kids', label: 'Has kids' },
    { slug: 'no_kids', label: 'No kids, thanks' },
    { slug: 'religious', label: 'Religious / spiritual' },
    { slug: 'vegan', label: 'Vegan / vegetarian' },
    { slug: 'night_owl', label: 'Night owl' },
    { slug: 'early_bird', label: 'Early bird' },
]

export const DEALBREAKERS_OPTIONS: Array<{ slug: string; label: string }> = [
    { slug: 'smoking', label: 'Smoking' },
    { slug: 'heavy_drinking', label: 'Heavy drinking' },
    { slug: 'no_ambition', label: 'No ambition' },
    { slug: 'dishonesty', label: 'Dishonesty' },
    { slug: 'wants_kids', label: 'Wants kids' },
    { slug: 'doesnt_want_kids', label: "Doesn't want kids" },
    { slug: 'long_distance', label: 'Long distance' },
    { slug: 'poor_communication', label: 'Poor communication' },
    { slug: 'closed_minded', label: 'Closed-minded' },
]

export const MAX_INTERESTS = 10
export const MAX_LIFESTYLE = 8
export const MAX_DEALBREAKERS = 6
export const MAX_IDEAL_PARTNER_LENGTH = 280

export const RELATIONSHIP_GOAL_SLUGS: ReadonlySet<RelationshipGoal> = new Set(
    RELATIONSHIP_GOALS.map((g) => g.slug),
)
export const INTEREST_SLUGS: ReadonlySet<string> = new Set(INTERESTS_OPTIONS.map((o) => o.slug))
export const LIFESTYLE_SLUGS: ReadonlySet<string> = new Set(LIFESTYLE_OPTIONS.map((o) => o.slug))
export const DEALBREAKER_SLUGS: ReadonlySet<string> = new Set(
    DEALBREAKERS_OPTIONS.map((o) => o.slug),
)

export const findLabel = (
    options: Array<{ slug: string; label: string }>,
    slug: string,
): string => options.find((o) => o.slug === slug)?.label ?? slug
