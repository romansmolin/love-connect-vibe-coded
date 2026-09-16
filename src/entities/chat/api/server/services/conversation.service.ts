import crypto from 'node:crypto'

import type { ChatMessageRecord, SimulatedPersona } from '@prisma/client'

import { creditService } from '@/entities/credit/api/server/credit.service'
import { appUserRepo } from '@/entities/demo-activity/api/server/repositories/app-user.repo'
import { simulatedMatchRepo } from '@/entities/demo-activity/api/server/repositories/simulated-match.repo'
import { personaMatchService } from '@/entities/demo-activity/api/server/services/persona-match.service'
import { replyGenerationService } from '@/entities/demo-activity/api/server/services/reply-generation.service'
import { giftService } from '@/entities/gift/api/server/gift.service'
import { userService } from '@/entities/user/api/server/services/user.service'
import { HttpError } from '@/shared/http-client'

import type {
    ConversationMessage,
    ConversationMessagesResponse,
    ConversationSummary,
    ConversationsResponse,
    SendConversationMessageResponse,
    SendGiftInChatResponse,
    UnlockConversationResponse,
} from '../../../model/types'
import { conversationMessageRepo } from '../repositories/conversation-message.repo'
import { conversationRepo } from '../repositories/conversation.repo'

import { publishChatEvent } from './chat-events'

const UNLOCK_COST = 300
const MIN_REPLY_DELAY_MS = 30_000
const MAX_REPLY_DELAY_MS = 5 * 60_000

type MessageRow = Awaited<ReturnType<typeof conversationMessageRepo.create>>

const toMessage = (row: MessageRow): ConversationMessage => ({
    id: row.id,
    senderDatingId: row.senderDatingId,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    deliveredAt: row.deliveredAt?.toISOString() ?? null,
    readAt: row.readAt?.toISOString() ?? null,
    isAiGenerated: row.isAiGenerated,
    gift: row.gift
        ? {
              transactionId: row.giftTransactionId ?? row.id,
              giftId: row.gift.id,
              name: row.gift.name,
              emoji: row.gift.emoji,
              imageUrl: row.gift.imageUrl,
          }
        : undefined,
})

const peerIsAdmirer = async (appUserId: string, peerDatingId: number) => {
    const persona = await personaMatchService.findLinkedPersona(appUserId, peerDatingId)
    if (!persona) return false
    return Boolean(await simulatedMatchRepo.findLink(appUserId, persona.id, 'MUTUAL_MATCH'))
}

const buildFallbackPersona = async (sessionId: string, peerDatingId: number): Promise<SimulatedPersona> => {
    try {
        const profile = await userService.getMemberProfile({ sessionId, userId: peerDatingId })
        return {
            id: `conversation:${peerDatingId}`,
            fotochatUserId: peerDatingId,
            username: profile.username,
            age: profile.age ?? null,
            location: profile.location ?? null,
            gender: profile.gender ?? null,
            photoUrl: profile.avatarUrl ?? null,
            bio: profile.description ?? null,
            createdAt: new Date(),
        }
    } catch {
        return {
            id: `conversation:${peerDatingId}`,
            fotochatUserId: peerDatingId,
            username: `Member ${peerDatingId}`,
            age: null,
            location: null,
            gender: null,
            photoUrl: null,
            bio: null,
            createdAt: new Date(),
        }
    }
}

const scheduleReply = (input: {
    appUserId: string
    sessionId: string
    conversationId: string
    peerDatingId: number
    actorDatingId: number
}) => {
    const delay = Math.floor(MIN_REPLY_DELAY_MS + Math.random() * (MAX_REPLY_DELAY_MS - MIN_REPLY_DELAY_MS))
    setTimeout(async () => {
        try {
            const persona =
                (await personaMatchService.findLinkedPersona(input.appUserId, input.peerDatingId)) ??
                (await buildFallbackPersona(input.sessionId, input.peerDatingId))
            const history = await conversationMessageRepo.list(input.conversationId, undefined, 12)
            const reply = await replyGenerationService.generateReply(
                persona,
                history
                    .slice()
                    .reverse()
                    .map(
                        (message) =>
                            ({
                                senderIsPersona: message.senderDatingId === input.peerDatingId,
                                text: message.body,
                            }) as unknown as ChatMessageRecord
                    ) as never
            )
            if (!reply.trim()) return
            const now = new Date()
            const created = await conversationMessageRepo.create({
                conversationId: input.conversationId,
                senderDatingId: input.peerDatingId,
                body: reply.trim(),
                idempotencyKey: `ai:${crypto.randomUUID()}`,
                deliveredAt: now,
                isAiGenerated: true,
            })
            await conversationRepo.touch(input.conversationId, now)
            publishChatEvent([input.actorDatingId, input.peerDatingId], {
                type: 'message.created',
                peerDatingId: input.peerDatingId,
                message: toMessage(created),
            })
        } catch (error) {
            console.error('[conversation-ai-reply] failed', error)
        }
    }, delay)
}

export const conversationService = {
    async list(appUserId: string, sessionId: string): Promise<ConversationsResponse> {
        await appUserRepo.touch(appUserId)
        const conversations = await conversationRepo.listForUser(appUserId)
        const items = await Promise.all(
            conversations.map(async (conversation): Promise<ConversationSummary> => {
                const [preview, unreadCount, profile] = await Promise.all([
                    conversationMessageRepo.latest(conversation.id),
                    conversationRepo.unreadCount(conversation.id, conversation.lastReadAt),
                    userService
                        .getMemberProfile({ sessionId, userId: conversation.peerDatingId })
                        .catch(() => null),
                ])
                return {
                    peerDatingId: conversation.peerDatingId,
                    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
                    lastReadAt: conversation.lastReadAt?.toISOString() ?? null,
                    lastPreview: preview?.gift ? `🎁 ${preview.gift.name}` : (preview?.body ?? null),
                    unreadCount,
                    peerProfile: profile
                        ? { username: profile.username, avatarUrl: profile.avatarUrl, isOnline: false }
                        : null,
                }
            })
        )
        return { items }
    },
    async messages(input: {
        appUserId: string
        peerDatingId: number
        before?: string
        limit: number
    }): Promise<ConversationMessagesResponse> {
        const [conversation, admirer] = await Promise.all([
            conversationRepo.findByPeer(input.appUserId, input.peerDatingId),
            peerIsAdmirer(input.appUserId, input.peerDatingId),
        ])
        if (!conversation) return { messages: [], nextCursor: null, unlocked: false, peerIsAdmirer: admirer }
        const rows = await conversationMessageRepo.list(
            conversation.id,
            input.before ? new Date(input.before) : undefined,
            input.limit
        )
        return {
            messages: rows.map(toMessage),
            nextCursor: rows.length === input.limit ? (rows.at(-1)?.createdAt.toISOString() ?? null) : null,
            unlocked: Boolean(conversation.unlockedAt),
            peerIsAdmirer: admirer,
        }
    },
    async sendMessage(input: {
        appUserId: string
        sessionId: string
        actorDatingId: number
        peerDatingId: number
        body: string
        idempotencyKey: string
    }): Promise<SendConversationMessageResponse> {
        const body = input.body.trim()
        if (!body || body.length > 5000) throw new HttpError('Message must be between 1 and 5000 characters.', 400)
        const conversation = await conversationRepo.ensure(input.appUserId, input.peerDatingId)
        const existing = await conversationMessageRepo.findByIdempotencyKey(conversation.id, input.idempotencyKey)
        if (existing) return { message: toMessage(existing) }
        if (!conversation.unlockedAt && !(await peerIsAdmirer(input.appUserId, input.peerDatingId))) {
            throw new HttpError(`Unlock this chat for ${UNLOCK_COST} credits to send messages.`, 402)
        }
        const now = new Date()
        const created = await conversationMessageRepo.create({
            conversationId: conversation.id,
            senderDatingId: input.actorDatingId,
            body,
            idempotencyKey: input.idempotencyKey,
            deliveredAt: now,
        })
        await conversationRepo.touch(conversation.id, now)
        const message = toMessage(created)
        publishChatEvent([input.actorDatingId, input.peerDatingId], {
            type: 'message.created',
            peerDatingId: input.peerDatingId,
            message,
        })
        scheduleReply({ ...input, conversationId: conversation.id })
        return { message }
    },
    async sendGift(input: {
        appUserId: string
        sessionId: string
        actorDatingId: number
        peerDatingId: number
        giftId: string
        idempotencyKey: string
    }): Promise<SendGiftInChatResponse> {
        const conversation = await conversationRepo.ensure(input.appUserId, input.peerDatingId)
        const existing = await conversationMessageRepo.findByIdempotencyKey(conversation.id, input.idempotencyKey)
        if (existing)
            return { message: toMessage(existing), transactionId: existing.id, creditsSpent: 0, walletBalance: 0 }
        const result = await giftService.sendGiftInConversation({
            senderId: input.appUserId,
            recipientId: String(input.peerDatingId),
            giftId: input.giftId,
            idempotencyKey: input.idempotencyKey,
        })
        const now = new Date()
        const created = await conversationMessageRepo.create({
            conversationId: conversation.id,
            senderDatingId: input.actorDatingId,
            body: `🎁 ${result.transaction.gift.name}`,
            idempotencyKey: input.idempotencyKey,
            deliveredAt: now,
            giftId: result.transaction.gift.id,
            giftTransactionId: result.transaction.id,
        })
        await conversationRepo.touch(conversation.id, now)
        const message = toMessage(created)
        publishChatEvent([input.actorDatingId, input.peerDatingId], {
            type: 'message.created',
            peerDatingId: input.peerDatingId,
            message,
        })
        scheduleReply({ ...input, conversationId: conversation.id })
        return {
            message,
            transactionId: result.transaction.id,
            creditsSpent: result.creditsSpent,
            walletBalance: result.walletBalance,
        }
    },
    async markRead(appUserId: string, peerDatingId: number) {
        const conversation = await conversationRepo.findByPeer(appUserId, peerDatingId)
        if (!conversation) throw new HttpError('Conversation not found', 404)
        const now = new Date()
        await conversationRepo.markRead(conversation.id, now)
        return { lastReadAt: now.toISOString() }
    },
    async unlock(appUserId: string, peerDatingId: number): Promise<UnlockConversationResponse> {
        const conversation = await conversationRepo.ensure(appUserId, peerDatingId)
        if (conversation.unlockedAt) {
            const wallet = await creditService.getWallet(appUserId)
            return { unlockedAt: conversation.unlockedAt.toISOString(), remainingBalance: wallet.wallet.balance }
        }
        if (!(await peerIsAdmirer(appUserId, peerDatingId))) {
            await creditService.spendCredits({
                userId: appUserId,
                credits: UNLOCK_COST,
                amountCents: UNLOCK_COST * 10,
                description: `Unlock chat with dating user ${peerDatingId}`,
            })
        }
        const now = new Date()
        await conversationRepo.unlock(conversation.id, now)
        const wallet = await creditService.getWallet(appUserId)
        return { unlockedAt: now.toISOString(), remainingBalance: wallet.wallet.balance }
    },
}
