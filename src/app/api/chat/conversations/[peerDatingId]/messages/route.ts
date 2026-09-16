import type { NextRequest } from 'next/server'

import {
    conversationMessagesRoute,
    conversationSendRoute,
} from '@/entities/chat/api/server/routes/conversation.route'

type Context = { params: Promise<{ peerDatingId: string }> }

export const GET = async (request: NextRequest, context: Context) => {
    const { peerDatingId } = await context.params
    return conversationMessagesRoute(request, peerDatingId)
}

export const POST = async (request: NextRequest, context: Context) => {
    const { peerDatingId } = await context.params
    return conversationSendRoute(request, peerDatingId)
}
