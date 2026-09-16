import type { SimulatedPersona } from '@prisma/client'

import type { ChatMessage, ContactPreview, SendMessageResponse } from '@/entities/chat/model/types'
import type { MatchCandidate } from '@/entities/match/model/types'
import { HttpError } from '@/shared/http-client'

import { mapPersonaToContactPreview, mapPersonaToMatchCandidate } from '../../../lib/persona-mapper'
import { randomReplyDelayMs } from '../../../lib/reply-timing'
import { simulatedMatchRepo } from '../repositories/simulated-match.repo'
import { simulatedMessageRepo } from '../repositories/simulated-message.repo'
import { simulatedPersonaRepo } from '../repositories/simulated-persona.repo'

import { replySchedulerService } from './reply-scheduler.service'

const LIKE_VOTE_VALUE = 5

export const personaMatchService = {
    async listSimulatedLikes(appUserId: string): Promise<(MatchCandidate & { vote?: number })[]> {
        const rows = await simulatedMatchRepo.listWithPersonas(appUserId, 'LIKE')
        return rows.map(({ persona }) => ({ ...mapPersonaToMatchCandidate(persona), vote: LIKE_VOTE_VALUE }))
    },
    async listSimulatedMutualMatches(appUserId: string): Promise<MatchCandidate[]> {
        const rows = await simulatedMatchRepo.listWithPersonas(appUserId, 'MUTUAL_MATCH')
        return rows.map(({ persona }) => mapPersonaToMatchCandidate(persona))
    },
    async listSimulatedContacts(appUserId: string): Promise<ContactPreview[]> {
        const rows = await simulatedMatchRepo.listWithPersonas(appUserId, 'MUTUAL_MATCH')

        return Promise.all(
            rows.map(async ({ persona }) => {
                const recent = await simulatedMessageRepo.listByConversation(appUserId, persona.id, 1)
                return mapPersonaToContactPreview(persona, recent[0]?.text, recent[0]?.sentAt.toISOString())
            })
        )
    },
    /**
     * The single "is this id a simulated persona *for this user*" check.
     *
     * A `SimulatedPersona` row is harvested from the live fotochat pool, so its `fotochatUserId`
     * can collide with a real member this user actually talks to. Matching on the persona row
     * alone would hijack that real relationship, so a persona only counts as simulated here when
     * this specific `appUserId` has a `SimulatedMatch` link to it. Every merge point and every
     * mutation guard must go through this, never through a bare id lookup.
     */
    async findLinkedPersona(appUserId: string, fotochatUserId: number): Promise<SimulatedPersona | null> {
        const persona = await simulatedPersonaRepo.findByFotochatId(fotochatUserId)
        if (!persona) return null

        const link = await simulatedMatchRepo.findLink(appUserId, persona.id)

        return link ? persona : null
    },
    /** Like-back on a simulated persona: promote the local link to a mutual match. Never goes upstream. */
    async likeBackPersona(appUserId: string, personaId: string): Promise<void> {
        await simulatedMatchRepo.create(appUserId, personaId, 'MUTUAL_MATCH')
        await simulatedMatchRepo.deleteLinks(appUserId, personaId, 'LIKE')
    },
    /**
     * Tombstone every local link to a persona (kind -> DISMISSED) so it stops showing up in Who
     * Liked You / Matches / Chat contacts for this user. Never goes upstream.
     *
     * This must NOT delete the `SimulatedMatch` row: `findLinkedPersona` has to keep resolving this
     * id as "a persona for this user" even after dismissal, or a stale UI card could route a
     * subsequent like/report to the real fotochat member sharing this id.
     */
    async unlinkPersona(appUserId: string, personaId: string): Promise<void> {
        await simulatedMatchRepo.dismissLinks(appUserId, personaId)
    },
    async listSimulatedMessages(appUserId: string, personaId: string): Promise<ChatMessage[]> {
        // Lazy reply generation is best-effort: it must never stop the stored history from loading.
        try {
            await replySchedulerService.processDueForConversation(appUserId, personaId)
        } catch (error) {
            console.error('[demo-activity] lazy reply processing failed', error)
        }

        const persona = await simulatedPersonaRepo.findById(personaId)
        const rows = await simulatedMessageRepo.listByConversation(appUserId, personaId, 50)

        return rows.map((row) => {
            const giftTransaction = row.giftTransaction
            return {
                id: giftTransaction ? `gift:${giftTransaction.id}` : row.id,
                senderId: row.senderIsPersona ? persona?.fotochatUserId : Number(appUserId),
                text: row.text,
                sentAt: row.sentAt.toISOString(),
                gift: giftTransaction
                    ? {
                          transactionId: giftTransaction.id,
                          giftId: giftTransaction.gift.id,
                          name: giftTransaction.gift.name,
                          emoji: giftTransaction.gift.emoji,
                          imageUrl: giftTransaction.gift.imageUrl,
                      }
                    : undefined,
            }
        })
    },
    async sendSimulatedMessage(
        appUserId: string,
        personaId: string,
        text: string,
        idempotencyKey?: string
    ): Promise<SendMessageResponse> {
        if (!text.trim()) {
            throw new HttpError('Message cannot be empty', 400)
        }

        if (idempotencyKey) {
            const existing = await simulatedMessageRepo.findByIdempotencyKey(appUserId, personaId, idempotencyKey)
            if (existing) {
                return { message: existing.text, date: existing.sentAt.toISOString() }
            }
        }

        const scheduledReplyAt = new Date(Date.now() + randomReplyDelayMs())
        const message = await simulatedMessageRepo.insertInbound(
            appUserId,
            personaId,
            text,
            scheduledReplyAt,
            idempotencyKey
        )

        return { message: message.text, date: message.sentAt.toISOString() }
    },
    async ensureSimulatedGiftMessage(params: {
        appUserId: string
        personaId: string
        transactionId: string
        giftName: string
    }) {
        return simulatedMessageRepo.ensureGiftMessage({
            appUserId: params.appUserId,
            personaId: params.personaId,
            giftTransactionId: params.transactionId,
            text: `🎁 ${params.giftName}`,
            scheduledReplyAt: new Date(Date.now() + randomReplyDelayMs()),
        })
    },
}
