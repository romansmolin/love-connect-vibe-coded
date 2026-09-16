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

/**
 * The claim is optimistic — it is taken before generation so two workers cannot reply twice.
 * If generation then fails (OpenAI error/timeout/missing key) the claim must be released, or the
 * message stays marked "replied" forever with no reply and no cron tick will ever revisit it.
 * One bad message also must not abort the rest of the batch.
 */
const runClaimedReply = async (message: SimulatedMessage): Promise<boolean> => {
    try {
        await generateAndStoreReply(message)
        return true
    } catch (error) {
        console.error(`[demo-activity] reply generation failed for message ${message.id}, releasing claim`, error)
        try {
            await simulatedMessageRepo.releaseReply(message.id)
        } catch (releaseError) {
            console.error(`[demo-activity] failed to release reply claim for message ${message.id}`, releaseError)
        }
        return false
    }
}

export const replySchedulerService = {
    async processDueReplies(limit: number): Promise<number> {
        const now = new Date()
        const due = await simulatedMessageRepo.findDueForReply(now, limit)

        let processed = 0
        for (const message of due) {
            const claimed = await simulatedMessageRepo.claimReply(message.id, now)
            if (!claimed) continue

            if (await runClaimedReply(message)) {
                processed += 1
            }
        }

        return processed
    },
    async processDueForConversation(appUserId: string, personaId: string): Promise<void> {
        const now = new Date()
        const due = await simulatedMessageRepo.findDueForConversation(appUserId, personaId, now)

        for (const message of due) {
            const claimed = await simulatedMessageRepo.claimReply(message.id, now)
            if (!claimed) continue

            await runClaimedReply(message)
        }
    },
}
