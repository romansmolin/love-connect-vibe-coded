import { createHttpClient } from '@/shared/http-client'

export const FOTOCHAT_BASE_URL = 'https://api.fotochat.com'
export const FOTOCHAT_API_KEY = process.env.FOTOCHAT_API_KEY ?? 'b3128a05d2dedf5eeb6a9ac5febc6aee'

export const fotochatHttpClient = createHttpClient(FOTOCHAT_BASE_URL)

export const SESSION_COOKIE_NAME = 'fotochat_session_id'
export const USER_COOKIE_NAME = 'fotochat_user_id'
export const LANG_COOKIE_NAME = 'fotochat_lang'
