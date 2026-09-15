import { authService } from '@/entities/user/api/server/services/auth.service'

let cachedSession: { sessionId: string; userId: number; obtainedAt: number } | null = null

const SESSION_TTL_MS = 5 * 60 * 60 * 1000

const requireEnv = (name: string): string => {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

export const serviceSessionService = {
    async getSessionId(forceRefresh = false): Promise<string> {
        const isFresh = cachedSession !== null && Date.now() - cachedSession.obtainedAt < SESSION_TTL_MS

        if (!forceRefresh && isFresh && cachedSession) {
            return cachedSession.sessionId
        }

        const username = requireEnv('CRON_SERVICE_USERNAME')
        const password = requireEnv('CRON_SERVICE_PASSWORD')

        const result = await authService.signIn({ username, password })

        cachedSession = { sessionId: result.sessionId, userId: result.userId, obtainedAt: Date.now() }

        return cachedSession.sessionId
    },
}
