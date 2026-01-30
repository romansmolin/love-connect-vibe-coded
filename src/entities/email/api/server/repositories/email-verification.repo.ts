import { prisma } from '@/shared/lib/prisma'

export const emailVerificationRepo = {
    createToken(params: { emailContactId: string; tokenHash: string; expiresAt: Date }) {
        return prisma.emailVerificationToken.create({
            data: {
                emailContactId: params.emailContactId,
                tokenHash: params.tokenHash,
                expiresAt: params.expiresAt,
            },
        })
    },

    findValidToken(tokenHash: string) {
        return prisma.emailVerificationToken.findFirst({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: { emailContact: true },
        })
    },

    markUsed(id: string) {
        return prisma.emailVerificationToken.update({
            where: { id },
            data: { usedAt: new Date() },
        })
    },
}
