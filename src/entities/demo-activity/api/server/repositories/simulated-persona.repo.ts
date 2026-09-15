import type { SimulatedMatchKind, SimulatedPersona } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

import type { PersonaUpsertInput } from '../../../lib/persona-mapper'

export const simulatedPersonaRepo = {
    async upsertMany(personas: PersonaUpsertInput[]): Promise<void> {
        if (personas.length === 0) return

        await prisma.$transaction(
            personas.map((persona) =>
                prisma.simulatedPersona.upsert({
                    where: { fotochatUserId: persona.fotochatUserId },
                    update: {
                        username: persona.username,
                        age: persona.age,
                        location: persona.location,
                        gender: persona.gender,
                        photoUrl: persona.photoUrl,
                    },
                    create: persona,
                })
            )
        )
    },
    findByFotochatId(fotochatUserId: number): Promise<SimulatedPersona | null> {
        return prisma.simulatedPersona.findUnique({ where: { fotochatUserId } })
    },
    findById(id: string): Promise<SimulatedPersona | null> {
        return prisma.simulatedPersona.findUnique({ where: { id } })
    },
    async pickRandomUnlinked(appUserId: string, kind: SimulatedMatchKind): Promise<SimulatedPersona | null> {
        const linked = await prisma.simulatedMatch.findMany({
            where: { appUserId, kind },
            select: { personaId: true },
        })
        const linkedIds = linked.map((row) => row.personaId)

        const candidates = await prisma.simulatedPersona.findMany({
            where: linkedIds.length > 0 ? { id: { notIn: linkedIds } } : undefined,
        })

        if (candidates.length === 0) return null

        return candidates[Math.floor(Math.random() * candidates.length)]
    },
}
