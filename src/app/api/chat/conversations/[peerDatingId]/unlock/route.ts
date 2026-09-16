import type { NextRequest } from 'next/server'

import { conversationUnlockRoute } from '@/entities/chat/api/server/routes/conversation.route'

export const POST = async (request: NextRequest, context: { params: Promise<{ peerDatingId: string }> }) => {
    const { peerDatingId } = await context.params
    return conversationUnlockRoute(request, peerDatingId)
}
