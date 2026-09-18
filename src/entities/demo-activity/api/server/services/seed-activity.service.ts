import { matchService } from '@/entities/match/api/server/services/match.service'
import { HttpError } from '@/shared/http-client'

import { planSeedActivity } from '../../../lib/activity-plan'
import { mapCandidateToPersonaInput } from '../../../lib/persona-mapper'
import { appUserRepo } from '../repositories/app-user.repo'
import { simulatedMatchRepo } from '../repositories/simulated-match.repo'
import { simulatedPersonaRepo } from '../repositories/simulated-persona.repo'

import { serviceSessionService } from './service-session.service'

/** A periodic seed tick harvests a few pages, not the whole pool — this runs inside a cron timeout. */
const SEED_MAX_PAGES = 4
const RANDOM_POOL_SIZE = 200

const shuffle = <T>(items: T[]): T[] => {
    const result = [...items]

    for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
    }

    return result
}

const discoverProfiles = async (excludedIds: Set<number>) => {
    const session = await serviceSessionService.getSession()

    try {
        return await matchService.discoverPool(
            session.sessionId,
            {},
            excludedIds,
            undefined,
            undefined,
            SEED_MAX_PAGES,
            RANDOM_POOL_SIZE
        )
    } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
            const fresh = await serviceSessionService.getSession(true)
            return matchService.discoverPool(
                fresh.sessionId,
                {},
                excludedIds,
                undefined,
                undefined,
                SEED_MAX_PAGES,
                RANDOM_POOL_SIZE
            )
        }
        throw error
    }
}

export const seedActivityService = {
    async run(): Promise<{ personas: number; likes: number; mutualMatches: number }> {
        const appUsers = await appUserRepo.listAll()

        // A real love-bond account must never become anyone's "persona": its fotochat id would then
        // hijack real likes, blocks and conversations. Same for the cron service account itself.
        const session = await serviceSessionService.getSession()
        const excludedIds = new Set<number>()
        for (const id of [session.userId, ...appUsers.map((appUser) => Number(appUser.id))]) {
            if (Number.isInteger(id) && id > 0) excludedIds.add(id)
        }

        await simulatedPersonaRepo.deleteByFotochatIds([...excludedIds])

        const discovered = await discoverProfiles(excludedIds)
        const personaInputs = shuffle(discovered.items)
            .slice(0, RANDOM_POOL_SIZE)
            .filter((candidate) => !excludedIds.has(candidate.id))
            .map(mapCandidateToPersonaInput)
        await simulatedPersonaRepo.upsertMany(personaInputs)

        let likes = 0
        let mutualMatches = 0

        for (const appUser of appUsers) {
            const activityPlan = planSeedActivity(await simulatedMatchRepo.hasVisibleActivity(appUser.id))

            if (activityPlan.createLike) {
                const persona = await simulatedPersonaRepo.pickRandomUnlinked(appUser.id, 'LIKE')
                if (persona) {
                    await simulatedMatchRepo.create(appUser.id, persona.id, 'LIKE')
                    likes += 1
                }
            }

            if (activityPlan.createMutualMatch) {
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
