import { personaMatchService } from '@/entities/demo-activity/api/server/services/persona-match.service'
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
    async listContacts(sessionId: string, appUserId?: string): Promise<ContactsResponse> {
        const response = await chatRepo.loadContacts(sessionId)

        const realContacts = (response.contacts ?? []).map(mapContact)
        const simulatedContacts = appUserId ? await personaMatchService.listSimulatedContacts(appUserId) : []
        const realIds = new Set(realContacts.map((contact) => contact.id))
        const extraSimulated = simulatedContacts.filter((contact) => !realIds.has(contact.id))

        return { contacts: [...extraSimulated, ...realContacts] }
    },
    async listMessages(
        sessionId: string,
        contactId: number,
        contact?: string,
        appUserId?: string
    ): Promise<MessagesResponse> {
        if (appUserId) {
            const persona = await personaMatchService.findPersonaByFotochatId(contactId)
            if (persona) {
                return { messages: await personaMatchService.listSimulatedMessages(appUserId, persona.id) }
            }
        }

        const response = await chatRepo.loadMessages(sessionId, contactId, contact)
        const messages = response.eclairs ?? []

        return { messages: messages.map(mapMessage) }
    },
    async sendMessage(
        sessionId: string,
        payload: SendMessageRequest,
        appUserId?: string
    ): Promise<SendMessageResponse> {
        if (!payload.message.trim()) {
            throw new HttpError('Message cannot be empty', 400)
        }

        if (appUserId) {
            const persona = await personaMatchService.findPersonaByFotochatId(payload.contactId)
            if (persona) {
                return personaMatchService.sendSimulatedMessage(appUserId, persona.id, payload.message)
            }
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
