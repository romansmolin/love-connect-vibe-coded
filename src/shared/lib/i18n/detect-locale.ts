import 'server-only'
import type { NextRequest } from 'next/server'

const SUPPORTED = new Set([
    'en', 'ru', 'uk', 'fr', 'de', 'es', 'it', 'pt', 'pl', 'tr',
    'nl', 'cs', 'sk', 'ro', 'bg', 'el', 'sv', 'no', 'da', 'fi',
    'ja', 'ko', 'zh', 'ar', 'he', 'hi',
])

const LOCALE_COOKIE = 'NEXT_LOCALE'
const LOCALE_HEADER = 'x-locale'

const normalize = (raw: string | undefined | null): string | null => {
    if (!raw) return null
    const code = raw.trim().toLowerCase().split(/[-_]/)[0]
    return code && SUPPORTED.has(code) ? code : null
}

const parseAcceptLanguage = (header: string | null): string | null => {
    if (!header) return null
    const candidates = header
        .split(',')
        .map((part) => {
            const [tag, q = 'q=1'] = part.trim().split(';')
            const quality = Number(q.replace('q=', '')) || 0
            return { tag, quality }
        })
        .sort((a, b) => b.quality - a.quality)

    for (const { tag } of candidates) {
        const code = normalize(tag)
        if (code) return code
    }
    return null
}

export function detectLocale(req: NextRequest): string {
    return (
        normalize(req.headers.get(LOCALE_HEADER)) ??
        normalize(req.cookies.get(LOCALE_COOKIE)?.value) ??
        parseAcceptLanguage(req.headers.get('accept-language')) ??
        'en'
    )
}
