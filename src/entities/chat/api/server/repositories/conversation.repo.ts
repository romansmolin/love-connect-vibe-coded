import { prisma } from '@/shared/lib/prisma'

export const conversationRepo = {
    listForUser(userId: string) {
        return prisma.chatConversation.findMany({
            where: { userId },
            orderBy: [{ lastMessageAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
        })
    },
    ensure(userId: string, peerDatingId: number) {
        return prisma.chatConversation.upsert({
            where: { userId_peerDatingId: { userId, peerDatingId } },
            update: {},
            create: { userId, peerDatingId },
        })
    },
    findByPeer(userId: string, peerDatingId: number) {
        return prisma.chatConversation.findUnique({ where: { userId_peerDatingId: { userId, peerDatingId } } })
    },
    touch(id: string, lastMessageAt: Date) {
        return prisma.chatConversation.update({ where: { id }, data: { lastMessageAt } })
    },
    markRead(id: string, lastReadAt: Date) {
        return prisma.chatConversation.update({ where: { id }, data: { lastReadAt } })
    },
    unlock(id: string, unlockedAt: Date) {
        return prisma.chatConversation.update({ where: { id }, data: { unlockedAt } })
    },
    unreadCount(conversationId: string, lastReadAt: Date | null) {
        return prisma.chatMessageRecord.count({
            where: { conversationId, ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}) },
        })
    },
}
