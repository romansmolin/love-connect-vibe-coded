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

const mapContact = (contact: ContactBlock) => ({
    id: contact.m_id ?? 0,
    username: contact.pseudo ?? 'Member',
    avatarUrl: contact.photo ?? undefined,
    unreadCount: contact.nb_new,
    onlineStatus: mapOnline(contact.online),
    isFriend: contact.is_friend === 1,
    lastMessagePreview: Array.isArray(contact.tab_last_msg)
        ? contact.tab_last_msg[0]
        : contact.tab_last_msg ?? undefined,
})

const mapMessage = (message: EclairBlock): ChatMessage => ({
    id: message.id ?? `${message.exp ?? 'msg'}-${message.date ?? Date.now()}`,
    senderId: message.exp,
    text: message.msg,
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

        return chatRepo.sendMessage(sessionId, payload)
    },
}
