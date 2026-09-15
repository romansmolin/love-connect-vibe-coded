import type { SimulatedMessage } from '@prisma/client'

import { simulatedMessageRepo } from '../repositories/simulated-message.repo'
import { simulatedPersonaRepo } from '../repositories/simulated-persona.repo'
import { replyGenerationService } from './reply-generation.service'

const generateAndStoreReply = async (message: SimulatedMessage): Promise<void> => {
    const persona = await simulatedPersonaRepo.findById(message.personaId)
    if (!persona) return

    const history = await simulatedMessageRepo.listByConversation(message.appUserId, message.personaId, 10)
    const text = await replyGenerationService.generateReply(persona, history)

    await simulatedMessageRepo.insertPersonaReply(message.appUserId, message.personaId, text)
}

export const replySchedulerService = {
    async processDueReplies(limit: number): Promise<number> {
        const now = new Date()
        const due = await simulatedMessageRepo.findDueForReply(now, limit)

        let processed = 0
        for (const message of due) {
            const claimed = await simulatedMessageRepo.claimReply(message.id, now)
            if (!claimed) continue

            await generateAndStoreReply(message)
            processed += 1
        }

        return processed
    },
    async processDueForConversation(appUserId: string, personaId: string): Promise<void> {
        const now = new Date()
        const due = await simulatedMessageRepo.findDueForConversation(appUserId, personaId, now)

        for (const message of due) {
            const claimed = await simulatedMessageRepo.claimReply(message.id, now)
            if (!claimed) continue

            await generateAndStoreReply(message)
        }
    },
}
