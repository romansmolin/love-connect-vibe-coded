const PROCESSED_PROFILE_STORAGE_KEY = 'lovebond:processed-profile-ids'
const BLOCKED_PROFILE_STORAGE_KEY = 'lovebond:blocked-profile-ids'

const readJson = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback

    try {
        const value = window.localStorage.getItem(key)
        return value ? (JSON.parse(value) as T) : fallback
    } catch {
        return fallback
    }
}

const writeJson = (key: string, value: unknown) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
        // The browser may block storage. The deterministic fallback still works.
    }
}

export const getProcessedProfileIds = (): number[] => {
    const ids = readJson<unknown>(PROCESSED_PROFILE_STORAGE_KEY, [])
    return Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : []
}

export const getExcludedProfileIds = (): number[] => {
    const blocked = readJson<unknown>(BLOCKED_PROFILE_STORAGE_KEY, [])
    const blockedIds = Array.isArray(blocked) ? blocked.filter((id): id is number => typeof id === 'number') : []
    return [...new Set([...getProcessedProfileIds(), ...blockedIds])]
}

export const rememberProcessedProfile = (profileId: number) => {
    const ids = new Set(getProcessedProfileIds())
    ids.add(profileId)
    writeJson(PROCESSED_PROFILE_STORAGE_KEY, [...ids])
}
