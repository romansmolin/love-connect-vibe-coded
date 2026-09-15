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
}
