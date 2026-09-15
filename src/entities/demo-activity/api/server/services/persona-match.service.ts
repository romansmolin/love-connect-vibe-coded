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
                return mapPersonaToContactPreview(persona, recent[0]?.text)
            })
        )
    },
    findPersonaByFotochatId(fotochatUserId: number) {
        return simulatedPersonaRepo.findByFotochatId(fotochatUserId)
    },
    async listSimulatedMessages(appUserId: string, personaId: string): Promise<ChatMessage[]> {
        await replySchedulerService.processDueForConversation(appUserId, personaId)

        const persona = await simulatedPersonaRepo.findById(personaId)
        const rows = await simulatedMessageRepo.listByConversation(appUserId, personaId, 50)

        return rows.map((row) => ({
            id: row.id,
            senderId: row.senderIsPersona ? persona?.fotochatUserId : undefined,
            text: row.text,
            sentAt: row.sentAt.toISOString(),
        }))
    },
    async sendSimulatedMessage(appUserId: string, personaId: string, text: string): Promise<SendMessageResponse> {
        if (!text.trim()) {
            throw new HttpError('Message cannot be empty', 400)
        }

        const scheduledReplyAt = new Date(Date.now() + randomReplyDelayMs())
        const message = await simulatedMessageRepo.insertInbound(appUserId, personaId, text, scheduledReplyAt)

        return { message: message.text, date: message.sentAt.toISOString() }
    },
}
