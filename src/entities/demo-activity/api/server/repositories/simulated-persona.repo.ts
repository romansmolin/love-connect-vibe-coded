import type { SimulatedMatchKind, SimulatedPersona } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

import type { PersonaUpsertInput } from '../../../lib/persona-mapper'

/** One giant transaction blows past Prisma's default transaction timeout as the pool grows. */
const UPSERT_CHUNK_SIZE = 100

export const simulatedPersonaRepo = {
    async upsertMany(personas: PersonaUpsertInput[]): Promise<void> {
        if (personas.length === 0) return

        for (let start = 0; start < personas.length; start += UPSERT_CHUNK_SIZE) {
            const chunk = personas.slice(start, start + UPSERT_CHUNK_SIZE)

            await prisma.$transaction(
                chunk.map((persona) =>
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
        }
    },
    /**
     * Removes personas (and everything hanging off them) whose fotochat id belongs to a real
     * account — cleans up rows harvested before ids were excluded at seed time.
     */
    async deleteByFotochatIds(fotochatUserIds: number[]): Promise<number> {
        if (fotochatUserIds.length === 0) return 0

        const personas = await prisma.simulatedPersona.findMany({
            where: { fotochatUserId: { in: fotochatUserIds } },
            select: { id: true },
        })

        if (personas.length === 0) return 0

        const personaIds = personas.map((persona) => persona.id)

        await prisma.$transaction([
            prisma.simulatedMessage.deleteMany({ where: { personaId: { in: personaIds } } }),
            prisma.simulatedMatch.deleteMany({ where: { personaId: { in: personaIds } } }),
            prisma.simulatedPersona.deleteMany({ where: { id: { in: personaIds } } }),
        ])

        return personaIds.length
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
