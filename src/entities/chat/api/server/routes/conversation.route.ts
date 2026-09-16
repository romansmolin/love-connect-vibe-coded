import { type NextRequest, NextResponse } from 'next/server'

import { HttpError } from '@/shared/http-client'

import { conversationController } from '../controllers/conversation.controller'

const handle = async (operation: () => Promise<unknown>) => {
    try {
        return NextResponse.json(await operation())
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json({ message: error.message }, { status: error.status ?? 500 })
        }
        console.error('[conversation-route] unexpected error', error)
        return NextResponse.json({ message: 'Unexpected server error' }, { status: 500 })
    }
}

export const conversationsRoute = (request: NextRequest) => handle(() => conversationController.list(request))
export const conversationMessagesRoute = (request: NextRequest, peerDatingId?: string) =>
    handle(() => conversationController.messages(request, peerDatingId))
export const conversationSendRoute = (request: NextRequest, peerDatingId?: string) =>
    handle(() => conversationController.send(request, peerDatingId))
export const conversationGiftRoute = (request: NextRequest, peerDatingId?: string) =>
    handle(() => conversationController.gift(request, peerDatingId))
export const conversationReadRoute = (request: NextRequest, peerDatingId?: string) =>
    handle(() => conversationController.read(request, peerDatingId))
export const conversationUnlockRoute = (request: NextRequest, peerDatingId?: string) =>
    handle(() => conversationController.unlock(request, peerDatingId))
