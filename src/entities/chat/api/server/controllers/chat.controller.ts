import type { NextRequest } from 'next/server'

import { SESSION_COOKIE_NAME } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import type { SendMessageRequest } from '../../../model/types'
import { chatService } from '../services/chat.service'

const requireSessionId = (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionId) throw new HttpError('Unauthorized', 401)
    return sessionId
}

export const chatController = {
    async contacts(request: NextRequest) {
        const sessionId = requireSessionId(request)
        return chatService.listContacts(sessionId)
    },
    async messages(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)
        const contactId = Number(searchParams.get('contactId'))
        const contact = searchParams.get('contact') ?? undefined

        if (!Number.isFinite(contactId)) {
            throw new HttpError('contactId is required', 400)
        }

        return chatService.listMessages(sessionId, contactId, contact)
    },
    async send(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const body = (await request.json().catch(() => null)) as Partial<SendMessageRequest> | null

        if (!body || typeof body !== 'object' || !body.contactId) {
            throw new HttpError('Invalid payload', 400)
        }

        return chatService.sendMessage(sessionId, {
            contactId: Number(body.contactId),
            contact: body.contact,
            message: body.message ?? '',
        })
    },
}
