import type { NextRequest } from 'next/server'

import { conversationGiftRoute } from '@/entities/chat/api/server/routes/conversation.route'

export const POST = async (request: NextRequest, context: { params: Promise<{ peerDatingId: string }> }) => {
    const { peerDatingId } = await context.params
    return conversationGiftRoute(request, peerDatingId)
}
