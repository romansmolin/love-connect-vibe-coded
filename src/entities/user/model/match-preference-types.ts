export const LOOKING_FOR_PREFERENCES = ['man', 'woman', 'couple'] as const
export type LookingForPreference = (typeof LOOKING_FOR_PREFERENCES)[number]

export interface UserMatchPreferences {
    lookingFor: LookingForPreference | null
    updatedAt: string | null
}

export interface UpdateMatchPreferencesRequest {
    lookingFor: LookingForPreference | null
}

export const normalizeLookingFor = (
    raw: string | null | undefined,
): LookingForPreference | null => {
    if (!raw) return null
    const lower = raw.trim().toLowerCase()
    if (lower === 'man' || lower === 'men' || lower === 'male' || lower === '1') return 'man'
    if (lower === 'woman' || lower === 'women' || lower === 'female' || lower === '2')
        return 'woman'
    if (lower === 'couple' || lower === 'couples' || lower === '3') return 'couple'
    return null
}

export const lookingForToUpstreamCode = (
    value: LookingForPreference | null,
): '1' | '2' | '3' | undefined => {
    if (value === 'man') return '1'
    if (value === 'woman') return '2'
    if (value === 'couple') return '3'
    return undefined
}
