import type { SimulatedMatch, SimulatedMatchKind, SimulatedPersona } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

export const simulatedMatchRepo = {
    create(appUserId: string, personaId: string, kind: SimulatedMatchKind): Promise<SimulatedMatch> {
        return prisma.simulatedMatch.upsert({
            where: { appUserId_personaId_kind: { appUserId, personaId, kind } },
            update: {},
            create: { appUserId, personaId, kind },
        })
    },
    findLink(appUserId: string, personaId: string, kind?: SimulatedMatchKind): Promise<SimulatedMatch | null> {
        return prisma.simulatedMatch.findFirst({ where: { appUserId, personaId, ...(kind ? { kind } : {}) } })
    },
    async deleteLinks(appUserId: string, personaId: string, kind?: SimulatedMatchKind): Promise<number> {
        const result = await prisma.simulatedMatch.deleteMany({
            where: { appUserId, personaId, ...(kind ? { kind } : {}) },
        })
        return result.count
    },
    /**
     * Tombstone every non-dismissed link for this (appUserId, personaId) pair instead of deleting
     * it. A deleted row would let `findLink` return null and the persona id would revert to being
     * treated as an ordinary real fotochat member — the exact thing the safety guard exists to
     * prevent. `kind: { not: DISMISSED }` keeps this idempotent and avoids colliding with an
     * already-dismissed row under the `@@unique([appUserId, personaId, kind])` constraint.
     */
    async dismissLinks(appUserId: string, personaId: string): Promise<number> {
        const result = await prisma.simulatedMatch.updateMany({
            where: { appUserId, personaId, kind: { not: 'DISMISSED' } },
            data: { kind: 'DISMISSED' },
        })
        return result.count
    },
    async listWithPersonas(
        appUserId: string,
        kind: SimulatedMatchKind
    ): Promise<{ match: SimulatedMatch; persona: SimulatedPersona }[]> {
        const matches = await prisma.simulatedMatch.findMany({
            where: { appUserId, kind },
            orderBy: { createdAt: 'desc' },
        })

        if (matches.length === 0) return []

        const personas = await prisma.simulatedPersona.findMany({
            where: { id: { in: matches.map((match) => match.personaId) } },
        })
        const personaById = new Map(personas.map((persona) => [persona.id, persona]))

        return matches
            .map((match) => {
                const persona = personaById.get(match.personaId)
                return persona ? { match, persona } : null
            })
            .filter((row): row is { match: SimulatedMatch; persona: SimulatedPersona } => row !== null)
    },
    async hasVisibleActivity(appUserId: string): Promise<boolean> {
        const count = await prisma.simulatedMatch.count({
            where: {
                appUserId,
                kind: { in: ['LIKE', 'MUTUAL_MATCH'] },
            },
        })

        return count > 0
    },
}
