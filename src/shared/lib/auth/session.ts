export const TOKEN_COOKIE_NAME = 'token'
export const TOKEN_EXPIRY_STORAGE_KEY = 'auth_token_expiry'

export const rememberTokenExpiry = (expiresInSeconds = 60 * 60 * 24 * 7) => {
    if (typeof window === 'undefined') {
        return
    }

    const expiresAt = Date.now() + expiresInSeconds * 1000
    window.localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, String(expiresAt))
}
