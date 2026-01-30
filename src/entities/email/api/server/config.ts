export const SMTP_HOST = process.env.SMTP_HOST ?? ''
export const SMTP_PORT = Number(process.env.SMTP_PORT ?? '465')
export const SMTP_USER = process.env.SMTP_USER ?? ''
export const SMTP_PASS = process.env.SMTP_PASS ?? ''
export const SMTP_SECURE = (process.env.SMTP_SECURE ?? 'true') === 'true'

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'no-reply@love-bond.com'
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME ?? 'LoveBond'

export const APP_BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.FRONTEND_URL ??
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    ''

export const EMAIL_VERIFICATION_TTL_HOURS = Number(process.env.EMAIL_VERIFICATION_TTL_HOURS ?? '24')
