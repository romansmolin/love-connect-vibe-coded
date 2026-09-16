import { matchService } from '@/entities/match/api/server/services/match.service'
import { HttpError } from '@/shared/http-client'

import { mapCandidateToPersonaInput } from '../../../lib/persona-mapper'
import { rollProbability } from '../../../lib/seed-roll'
import { appUserRepo } from '../repositories/app-user.repo'
import { simulatedMatchRepo } from '../repositories/simulated-match.repo'
import { simulatedPersonaRepo } from '../repositories/simulated-persona.repo'
import { serviceSessionService } from './service-session.service'

const LIKE_RATE = 0.4
const MUTUAL_MATCH_RATE = 0.15

const discoverProfiles = async () => {
    const sessionId = await serviceSessionService.getSessionId()

    try {
        return await matchService.discoverPool(sessionId, {}, new Set())
    } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
            const freshSessionId = await serviceSessionService.getSessionId(true)
            return matchService.discoverPool(freshSessionId, {}, new Set())
        }
        throw error
    }
}

export const seedActivityService = {
    async run(): Promise<{ personas: number; likes: number; mutualMatches: number }> {
        const discovered = await discoverProfiles()
        const personaInputs = discovered.items.map(mapCandidateToPersonaInput)
        await simulatedPersonaRepo.upsertMany(personaInputs)

        const appUsers = await appUserRepo.listAll()
        let likes = 0
        let mutualMatches = 0

        for (const appUser of appUsers) {
            if (rollProbability(LIKE_RATE)) {
                const persona = await simulatedPersonaRepo.pickRandomUnlinked(appUser.id, 'LIKE')
                if (persona) {
                    await simulatedMatchRepo.create(appUser.id, persona.id, 'LIKE')
                    likes += 1
                }
            }

            if (rollProbability(MUTUAL_MATCH_RATE)) {
                const persona = await simulatedPersonaRepo.pickRandomUnlinked(appUser.id, 'MUTUAL_MATCH')
                if (persona) {
                    await simulatedMatchRepo.create(appUser.id, persona.id, 'MUTUAL_MATCH')
                    mutualMatches += 1
                }
            }
        }

        return { personas: personaInputs.length, likes, mutualMatches }
    },
}
