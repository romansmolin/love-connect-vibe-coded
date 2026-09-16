import type { NextRequest } from 'next/server'

import { conversationReadRoute } from '@/entities/chat/api/server/routes/conversation.route'

export const POST = async (request: NextRequest, context: { params: Promise<{ peerDatingId: string }> }) => {
    const { peerDatingId } = await context.params
    return conversationReadRoute(request, peerDatingId)
}
