import type { ChatMessage, ContactPreview } from '../model/types'

export type RawContact = {
    m_id?: number
    pseudo?: string
    photo?: unknown
    nb_new?: number
    online?: string
    is_friend?: number
    tab_last_msg?: unknown
}

export type RawMessage = {
    id?: number
    date?: string
    message?: unknown
    msg?: unknown
    exp?: string | number
    exp_id?: number
    p_extra?: unknown
    album_share?: string
}

export type DeliveredGiftLike = {
    id: string
    senderId: string
    deliveredAt: Date | null
    createdAt: Date
    gift: {
        id: string
        name: string
        emoji: string
        imageUrl: string
    }
}

const mapOnline = (online?: string): 'online' | 'recent' | 'offline' | undefined => {
    if (!online) return undefined
    if (online === 'green') return 'online'
    if (online === 'yellow') return 'recent'
    return 'offline'
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

/** FotoChat may wrap an EclairBlock inside one or more `message`/`msg` objects. */
const extractMessageText = (value: unknown, depth = 0): string | undefined => {
    if (depth > 4 || value === null || value === undefined) return undefined

    if (typeof value === 'string') {
        const text = value.trim()
        return text || undefined
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const text = extractMessageText(item, depth + 1)
            if (text) return text
        }
        return undefined
    }

    if (!isRecord(value)) return undefined

    for (const key of ['text', 'message', 'msg', 'content', 'body']) {
        const text = extractMessageText(value[key], depth + 1)
        if (text) return text
    }

    return undefined
}

const extractMessageDate = (value: unknown, depth = 0): string | undefined => {
    if (depth > 4 || value === null || value === undefined) return undefined
    if (Array.isArray(value)) {
        for (const item of value) {
            const date = extractMessageDate(item, depth + 1)
            if (date) return date
        }
        return undefined
    }
    if (!isRecord(value)) return undefined

    for (const key of ['date', 'sentAt', 'createdAt']) {
        if (typeof value[key] === 'string' && value[key].trim()) return value[key].trim() as string
    }
    for (const key of ['message', 'msg']) {
        const date = extractMessageDate(value[key], depth + 1)
        if (date) return date
    }
    return undefined
}

const toImageUrl = (value: string): string | undefined => {
    const url = value.trim()
    if (!url) return undefined
    if (url.startsWith('//')) return `https:${url}`
    if (url.startsWith('/')) return `https://api.fotochat.com${url}`
    return /^https?:\/\//i.test(url) ? url : undefined
}

const extractImageUrl = (value: unknown, depth = 0): string | undefined => {
    if (depth > 3 || value === null || value === undefined) return undefined
    if (typeof value === 'string') return toImageUrl(value)

    if (Array.isArray(value)) {
        for (const item of value) {
            const url = extractImageUrl(item, depth + 1)
            if (url) return url
        }
        return undefined
    }

    if (!isRecord(value)) return undefined

    for (const key of ['url', 'src', 'photo', 'normal', 'sq_430', 'url_big', 'url_middle', 'url_small']) {
        const url = extractImageUrl(value[key], depth + 1)
        if (url) return url
    }

    return undefined
}

export const mapContact = (contact: RawContact): ContactPreview => ({
    id: contact.m_id ?? 0,
    username: contact.pseudo ?? 'Member',
    avatarUrl: extractImageUrl(contact.photo),
    source: 'fotochat',
    unreadCount: contact.nb_new,
    onlineStatus: mapOnline(contact.online),
    isFriend: contact.is_friend === 1,
    lastMessagePreview: extractMessageText(contact.tab_last_msg),
    lastMessageAt: extractMessageDate(contact.tab_last_msg),
})

export const mapMessage = (message: RawMessage): ChatMessage => ({
    id: message.id ?? `${message.exp ?? 'msg'}-${message.date ?? Date.now()}`,
    senderId: message.exp_id,
    senderUsername: typeof message.exp === 'string' ? message.exp : undefined,
    text: extractMessageText(message.message) ?? extractMessageText(message.msg),
    sentAt: message.date,
    // `album_share` is an access-status string, not an image URL.
    extra: extractImageUrl(message.p_extra),
})

export const mapDeliveredGiftToMessage = (transaction: DeliveredGiftLike): ChatMessage => ({
    id: `gift:${transaction.id}`,
    senderId: Number.isFinite(Number(transaction.senderId)) ? Number(transaction.senderId) : undefined,
    text: `🎁 ${transaction.gift.name}`,
    sentAt: (transaction.deliveredAt ?? transaction.createdAt).toISOString(),
    gift: {
        transactionId: transaction.id,
        giftId: transaction.gift.id,
        name: transaction.gift.name,
        emoji: transaction.gift.emoji,
        imageUrl: transaction.gift.imageUrl,
    },
})
