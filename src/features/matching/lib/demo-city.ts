export const DEMO_CITIES = [
    'Amsterdam',
    'Berlin',
    'London',
    'Madrid',
    'New York',
    'Paris',
    'Prague',
    'Riga',
    'Rome',
    'Warsaw',
] as const

export type DemoCity = (typeof DEMO_CITIES)[number]

const DEMO_CITY_STORAGE_KEY = 'lovebond:demo-profile-cities'
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

export const getDemoCity = (profileId: number): DemoCity => {
    const assignments = readJson<Record<string, DemoCity>>(DEMO_CITY_STORAGE_KEY, {})
    const key = String(profileId)
    const savedCity = assignments[key]

    if (savedCity && DEMO_CITIES.includes(savedCity)) return savedCity

    const city = DEMO_CITIES[Math.abs(profileId) % DEMO_CITIES.length]
    writeJson(DEMO_CITY_STORAGE_KEY, { ...assignments, [key]: city })
    return city
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
