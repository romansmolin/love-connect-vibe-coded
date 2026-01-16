const offsetCache = new Map<string, number>()
const labelCache = new Map<string, string>()
const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>()

const INTL_WITH_SUPPORTED = Intl as typeof Intl & {
    supportedValuesOf?: (key: 'calendar' | 'co' | 'collation' | 'numberingSystem' | 'timeZone' | 'unit') => string[]
}

const formatOffsetFromMinutes = (minutes: number) => {
    if (!Number.isFinite(minutes)) {
        return 'UTC'
    }

    if (minutes === 0) {
        return 'UTC'
    }

    const absolute = Math.abs(Math.round(minutes))
    const hours = Math.floor(absolute / 60)
    const remainingMinutes = absolute % 60
    const sign = minutes >= 0 ? '+' : '-'

    return `UTC${sign}${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`
}

const normalizeTimeZoneName = (timeZone: string) =>
    timeZone
        .split('/')
        .map((segment) => segment.replace(/_/g, ' '))
        .join(' — ')

export const getTimezoneOffsetMinutes = (timeZone: string) => {
    if (!timeZone) return 0

    if (offsetCache.has(timeZone)) {
        return offsetCache.get(timeZone) ?? 0
    }

    try {
        const now = new Date()
        const localeStringOptions: Intl.DateTimeFormatOptions = {
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone,
        }

        const timezoneDate = new Date(now.toLocaleString('en-US', localeStringOptions))
        const utcDate = new Date(now.toLocaleString('en-US', { ...localeStringOptions, timeZone: 'UTC' }))

        const diffInMinutes = (timezoneDate.getTime() - utcDate.getTime()) / (1000 * 60)
        const minutes = Math.round(diffInMinutes)

        offsetCache.set(timeZone, minutes)

        return minutes
    } catch {
        offsetCache.set(timeZone, 0)
        return 0
    }
}

export const formatTimezoneLabel = (timeZone: string, offsetMinutes?: number) => {
    if (!timeZone) return ''

    if (labelCache.has(timeZone) && typeof offsetMinutes === 'undefined') {
        return labelCache.get(timeZone) ?? timeZone
    }

    if (timeZone === 'UTC' || timeZone === 'Etc/UTC') {
        return 'UTC'
    }

    const minutes = typeof offsetMinutes === 'number' ? offsetMinutes : getTimezoneOffsetMinutes(timeZone)
    const offset = formatOffsetFromMinutes(minutes)
    const name = normalizeTimeZoneName(timeZone)

    const label = `${offset} — ${name}`

    if (typeof offsetMinutes === 'undefined') {
        labelCache.set(timeZone, label)
    }

    return label
}

export const detectDeviceTimezone = () => {
    try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (detected && typeof detected === 'string') {
            return detected
        }
    } catch {
        // no-op
    }

    return 'UTC'
}

export const getSupportedTimezones = () => {
    if (typeof INTL_WITH_SUPPORTED.supportedValuesOf === 'function') {
        try {
            const supported = INTL_WITH_SUPPORTED.supportedValuesOf('timeZone')
            if (supported?.length) {
                return supported
            }
        } catch {
            // no-op
        }
    }

    return null
}

const getDateTimeFormatter = (timeZone: string) => {
    if (dateTimeFormatterCache.has(timeZone)) {
        return dateTimeFormatterCache.get(timeZone) as Intl.DateTimeFormat
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })

    dateTimeFormatterCache.set(timeZone, formatter)
    return formatter
}

const parseTimeParts = (time: string) => {
    const [hoursPart, minutesPart = '0', secondsPart = '0'] = time.split(':')

    const hours = Number(hoursPart)
    const minutes = Number(minutesPart)
    const seconds = Number(secondsPart)

    if ([hours, minutes, seconds].some((value) => Number.isNaN(value))) {
        return null
    }

    return { hours, minutes, seconds }
}

interface ConvertToUtcParams {
    date: Date
    time: string
    timezone?: string | null
}

const getPartNumberValue = (
    parts: Intl.DateTimeFormatPart[],
    type: Intl.DateTimeFormatPart['type'],
    fallback: number
) => {
    const part = parts.find((item) => item.type === type)
    if (!part) return fallback
    const value = Number(part.value)
    return Number.isNaN(value) ? fallback : value
}

const getFractionalMilliseconds = (parts: Intl.DateTimeFormatPart[]) => {
    const part = parts.find((item) => item.type === 'fractionalSecond')
    if (!part) return 0
    const normalized = part.value.padEnd(3, '0').slice(0, 3)
    const value = Number(normalized)
    return Number.isNaN(value) ? 0 : value
}

export const convertLocalTimeToUtcISOString = ({
    date,
    time,
    timezone,
}: ConvertToUtcParams) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime()) || !time) {
        return new Date().toISOString()
    }

    const parsedTime = parseTimeParts(time)

    if (!parsedTime) {
        return new Date(date).toISOString()
    }

    const { hours, minutes, seconds } = parsedTime

    const year = date.getFullYear()
    const monthIndex = date.getMonth()
    const day = date.getDate()

    const naiveUtc = Date.UTC(year, monthIndex, day, hours, minutes, seconds, 0)

    const effectiveTimezone = typeof timezone === 'string' && timezone.trim().length > 0 ? timezone : null

    if (!effectiveTimezone) {
        const localDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hours,
            minutes,
            seconds,
            0
        )
        return localDate.toISOString()
    }

    try {
        const formatter = getDateTimeFormatter(effectiveTimezone)
        const parts = formatter.formatToParts(new Date(naiveUtc))

        const adjustedYear = getPartNumberValue(parts, 'year', year)
        const adjustedMonth = getPartNumberValue(parts, 'month', monthIndex + 1) - 1
        const adjustedDay = getPartNumberValue(parts, 'day', day)
        const adjustedHour = getPartNumberValue(parts, 'hour', hours)
        const adjustedMinute = getPartNumberValue(parts, 'minute', minutes)
        const adjustedSecond = getPartNumberValue(parts, 'second', seconds)
        const adjustedMilliseconds = getFractionalMilliseconds(parts)

        const adjustedUtc = Date.UTC(
            adjustedYear,
            adjustedMonth,
            adjustedDay,
            adjustedHour,
            adjustedMinute,
            adjustedSecond,
            adjustedMilliseconds
        )

        const offset = adjustedUtc - naiveUtc
        const utcDate = new Date(naiveUtc - offset)

        return utcDate.toISOString()
    } catch {
        const fallbackDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hours,
            minutes,
            seconds,
            0
        )
        return fallbackDate.toISOString()
    }
}
