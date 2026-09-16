import { mapContact, mapDeliveredGiftToMessage, mapMessage } from '@/entities/chat/lib/chat-mapper'
import { personaMatchService } from '@/entities/demo-activity/api/server/services/persona-match.service'
import { giftService } from '@/entities/gift/api/server/gift.service'
import { HttpError } from '@/shared/http-client'

import type {
    ChatMessage,
    ContactsResponse,
    MessagesResponse,
    SendGiftInChatRequest,
    SendGiftInChatResponse,
    SendMessageRequest,
    SendMessageResponse,
} from '../../../model/types'
import { chatRepo } from '../repositories/chat.repo'

/**
 * Demo-activity is strictly additive: a failure in the simulated path must never take down the
 * real fotochat response it is merged into.
 */
const withoutSimulated = async <T>(label: string, load: () => Promise<T>, fallback: T): Promise<T> => {
    try {
        return await load()
    } catch (error) {
        console.error(`[demo-activity] ${label} failed, serving real data only`, error)
        return fallback
    }
}

const sortMessagesChronologically = (messages: ChatMessage[]): ChatMessage[] =>
    messages
        .map((message, index) => ({ message, index, timestamp: Date.parse(message.sentAt ?? '') }))
        .sort((left, right) => {
            const leftValid = Number.isFinite(left.timestamp)
            const rightValid = Number.isFinite(right.timestamp)
            if (leftValid && rightValid) return left.timestamp - right.timestamp
            if (leftValid !== rightValid) return leftValid ? 1 : -1
            return left.index - right.index
        })
        .map(({ message }) => message)

export const chatService = {
    async listContacts(sessionId: string, appUserId?: string): Promise<ContactsResponse> {
        const response = await chatRepo.loadContacts(sessionId)

        const realContacts = (response.contacts ?? []).map(mapContact)
        const simulatedContacts = appUserId
            ? await withoutSimulated(
                  'listSimulatedContacts',
                  () => personaMatchService.listSimulatedContacts(appUserId),
                  []
              )
            : []
        const realIds = new Set(realContacts.map((contact) => contact.id))
        const extraSimulated = simulatedContacts.filter((contact) => !realIds.has(contact.id))
        const contacts = [...extraSimulated, ...realContacts]

        if (!appUserId) return { contacts }

        const deliveredGifts = await withoutSimulated(
            'listDeliveredGiftsForUser',
            () => giftService.listDeliveredGiftsForUser(appUserId),
            []
        )
        const latestGiftByPeer = new Map<number, (typeof deliveredGifts)[number]>()
        for (const transaction of deliveredGifts) {
            const peerId = Number(
                transaction.senderId === appUserId ? transaction.recipientId : transaction.senderId
            )
            if (Number.isInteger(peerId) && peerId > 0 && !latestGiftByPeer.has(peerId)) {
                latestGiftByPeer.set(peerId, transaction)
            }
        }

        const withGiftPreviews = contacts.map((contact) => {
            const gift = latestGiftByPeer.get(contact.id)
            if (!gift) return contact

            const giftAt = gift.deliveredAt ?? gift.createdAt
            const messageAt = Date.parse(contact.lastMessageAt ?? '')
            if (Number.isFinite(messageAt) && messageAt > giftAt.getTime()) return contact

            return {
                ...contact,
                lastMessagePreview: `🎁 ${gift.gift.name}`,
                lastMessageAt: giftAt.toISOString(),
            }
        })

        return { contacts: withGiftPreviews }
    },
    async listMessages(
        sessionId: string,
        contactId: number,
        contact?: string,
        appUserId?: string
    ): Promise<MessagesResponse> {
        // Detection deliberately fails closed: if we cannot tell whether this contact is a persona
        // linked to this user, we must not guess, because guessing "real" would hit a real account.
        if (appUserId) {
            const persona = await personaMatchService.findLinkedPersona(appUserId, contactId)
            if (persona) {
                const simulatedMessages = await withoutSimulated(
                    'listSimulatedMessages',
                    () => personaMatchService.listSimulatedMessages(appUserId, persona.id),
                    [] as ChatMessage[]
                )
                const giftMessages = await withoutSimulated(
                    'listConversationGifts',
                    async () =>
                        (await giftService.listConversationGifts(appUserId, String(contactId))).map(
                            mapDeliveredGiftToMessage
                        ),
                    [] as ChatMessage[]
                )
                const messagesById = new Map<string, ChatMessage>()
                for (const message of [...simulatedMessages, ...giftMessages]) {
                    messagesById.set(String(message.id), message)
                }
                return { messages: sortMessagesChronologically([...messagesById.values()]) }
            }
        }

        const response = await chatRepo.loadMessages(sessionId, contactId, contact)
        const messages = (response.eclairs ?? []).map(mapMessage)
        const giftMessages = appUserId
            ? await withoutSimulated(
                  'listConversationGifts',
                  async () =>
                      (await giftService.listConversationGifts(appUserId, String(contactId))).map(
                          mapDeliveredGiftToMessage
                      ),
                  [] as ChatMessage[]
              )
            : []

        return { messages: sortMessagesChronologically([...messages, ...giftMessages]) }
    },
    async sendMessage(
        sessionId: string,
        payload: SendMessageRequest,
        appUserId?: string
    ): Promise<SendMessageResponse> {
        if (!payload.message.trim()) {
            throw new HttpError('Message cannot be empty', 400)
        }
        if (payload.message.trim().length > 5000) {
            throw new HttpError('Message is too long', 400)
        }

        if (appUserId) {
            const persona = await personaMatchService.findLinkedPersona(appUserId, payload.contactId)
            if (persona) {
                return personaMatchService.sendSimulatedMessage(
                    appUserId,
                    persona.id,
                    payload.message.trim(),
                    payload.idempotencyKey
                )
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
    async sendGiftInChat(
        sessionId: string,
        appUserId: string,
        payload: SendGiftInChatRequest
    ): Promise<SendGiftInChatResponse> {
        const persona = await personaMatchService.findLinkedPersona(appUserId, payload.contactId)
        const result = await giftService.sendGiftInChat({
            sessionId,
            senderId: appUserId,
            recipientId: String(payload.contactId),
            giftId: payload.giftId,
            idempotencyKey: payload.idempotencyKey,
        })

        if (persona) {
            try {
                await personaMatchService.ensureSimulatedGiftMessage({
                    appUserId,
                    personaId: persona.id,
                    transactionId: result.transaction.id,
                    giftName: result.transaction.gift.name,
                })
            } catch (error) {
                console.error('[chat-gift] failed to schedule simulated gift reply', error)
            }
        }

        return {
            message: mapDeliveredGiftToMessage(result.transaction),
            transactionId: result.transaction.id,
            creditsSpent: result.creditsSpent,
            walletBalance: result.walletBalance,
        }
    },
}
