import { PrismaClient } from '@prisma/client'

const datasourceUrl =
    process.env.PRISMA_DATABASE_URL ?? process.env.DATABASE_URL ?? process.env.POSTGRES_URL

const prismaClientSingleton = () =>
    new PrismaClient({
        datasources: datasourceUrl ? { db: { url: datasourceUrl } } : undefined,
    })

declare global {
     
    var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma
}
