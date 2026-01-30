import { prisma } from '@/shared/lib/prisma'

export const emailContactRepo = {
    upsertByExternalUserId(params: { externalUserId: string; email: string }) {
        return prisma.emailContact.upsert({
            where: { externalUserId: params.externalUserId },
            create: { externalUserId: params.externalUserId, email: params.email },
            update: { email: params.email },
        })
    },

    findByExternalUserId(externalUserId: string) {
        return prisma.emailContact.findUnique({
            where: { externalUserId },
        })
    },

    markVerified(id: string) {
        return prisma.emailContact.update({
            where: { id },
            data: { verifiedAt: new Date() },
        })
    },
}
