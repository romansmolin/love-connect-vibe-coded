import { HttpError } from '@/shared/http-client'

import type {
    ChatMessage,
    ContactsResponse,
    MessagesResponse,
    SendMessageRequest,
    SendMessageResponse,
} from '../../../model/types'
import { chatRepo } from '../repositories/chat.repo'
import type { ContactBlock, EclairBlock } from '../repositories/chat.repo'

const mapOnline = (online?: string): 'online' | 'recent' | 'offline' | undefined => {
    if (!online) return undefined
    if (online === 'green') return 'online'
    if (online === 'yellow') return 'recent'
    return 'offline'
}

const getLastMessagePreview = (value: ContactBlock['tab_last_msg']): string | undefined => {
    if (!value) return undefined
    const last = Array.isArray(value) ? value[0] : value
    if (typeof last === 'string') return last
    if (typeof last === 'object') return last.message ?? last.msg
    return undefined
}

const mapContact = (contact: ContactBlock) => ({
    id: contact.m_id ?? 0,
    username: contact.pseudo ?? 'Member',
    avatarUrl: contact.photo ?? undefined,
    unreadCount: contact.nb_new,
    onlineStatus: mapOnline(contact.online),
    isFriend: contact.is_friend === 1,
    lastMessagePreview: getLastMessagePreview(contact.tab_last_msg),
})

const mapMessage = (message: EclairBlock): ChatMessage => ({
    id: message.id ?? `${message.exp ?? 'msg'}-${message.date ?? Date.now()}`,
    senderId: message.exp_id,
    text: message.message ?? message.msg,
    sentAt: message.date,
    extra: message.p_extra ?? message.album_share,
})

export const chatService = {
    async listContacts(sessionId: string): Promise<ContactsResponse> {
        const response = await chatRepo.loadContacts(sessionId)

        const contacts = response.contacts ?? []
        return { contacts: contacts.map(mapContact) }
    },
    async listMessages(sessionId: string, contactId: number, contact?: string): Promise<MessagesResponse> {
        const response = await chatRepo.loadMessages(sessionId, contactId, contact)

        const messages = response.eclairs ?? []

        return { messages: messages.map(mapMessage) }
    },
    async sendMessage(sessionId: string, payload: SendMessageRequest): Promise<SendMessageResponse> {
        if (!payload.message.trim()) {
            throw new HttpError('Message cannot be empty', 400)
        }

        if (!payload.contact?.trim()) {
            throw new HttpError('Recipient username is required', 400)
        }

        const response = await chatRepo.sendMessage(sessionId, {
            contact: payload.contact,
            message: payload.message,
        })

        if (response.notification) {
            const message =
                response.notification === 'alert1'
                    ? 'You need an active subscription to send messages.'
                    : response.notification
            throw new HttpError(message, 402)
        }

        return { message: response.msg, date: response.date }
    },
}
