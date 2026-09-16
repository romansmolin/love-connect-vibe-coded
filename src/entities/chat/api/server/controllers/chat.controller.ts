import type { NextRequest } from 'next/server'

import { appUserRepo } from '@/entities/demo-activity/api/server/repositories/app-user.repo'
import { SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import type { SendGiftInChatRequest, SendMessageRequest } from '../../../model/types'
import { chatService } from '../services/chat.service'

const requireSessionId = (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionId) throw new HttpError('Unauthorized', 401)
    return sessionId
}

const getAppUserId = (request: NextRequest) => request.cookies.get(USER_COOKIE_NAME)?.value

export const chatController = {
    async contacts(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const appUserId = getAppUserId(request)

        if (appUserId) {
            await appUserRepo.touch(appUserId)
        }

        return chatService.listContacts(sessionId, appUserId)
    },
    async messages(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)
        const rawContactId = searchParams.get('contactId')
        const contactId = Number(rawContactId)
        const contact = searchParams.get('contact') ?? undefined

        if (!rawContactId || !Number.isInteger(contactId) || contactId <= 0) {
            throw new HttpError('contactId is required', 400)
        }

        const appUserId = getAppUserId(request)

        return chatService.listMessages(sessionId, contactId, contact, appUserId)
    },
    async send(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const body = (await request.json().catch(() => null)) as Partial<SendMessageRequest> | null
        const contactId = Number(body?.contactId)

        if (!body || typeof body !== 'object' || !Number.isInteger(contactId) || contactId <= 0) {
            throw new HttpError('Invalid payload', 400)
        }

        if (body.message !== undefined && typeof body.message !== 'string') {
            throw new HttpError('Invalid payload', 400)
        }

        const appUserId = getAppUserId(request)

        return chatService.sendMessage(
            sessionId,
            {
                contactId,
                contact: typeof body.contact === 'string' ? body.contact : undefined,
                message: body.message ?? '',
                idempotencyKey: typeof body.idempotencyKey === 'string' ? body.idempotencyKey : undefined,
            },
            appUserId
        )
    },
    async gift(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const appUserId = getAppUserId(request)
        if (!appUserId) throw new HttpError('Unauthorized', 401)

        const body = (await request.json().catch(() => null)) as Partial<SendGiftInChatRequest> | null
        const contactId = Number(body?.contactId)

        if (
            !body ||
            !Number.isInteger(contactId) ||
            contactId <= 0 ||
            typeof body.giftId !== 'string' ||
            !body.giftId.trim() ||
            typeof body.idempotencyKey !== 'string' ||
            !body.idempotencyKey.trim() ||
            body.idempotencyKey.length > 120
        ) {
            throw new HttpError('Invalid payload', 400)
        }

        return chatService.sendGiftInChat(sessionId, appUserId, {
            contactId,
            giftId: body.giftId,
            idempotencyKey: body.idempotencyKey,
        })
    },
}
