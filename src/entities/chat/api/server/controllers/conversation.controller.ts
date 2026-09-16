import type { NextRequest } from 'next/server'

import { SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import { conversationService } from '../services/conversation.service'

const requireUser = (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const appUserId = request.cookies.get(USER_COOKIE_NAME)?.value
    const actorDatingId = Number(appUserId)
    if (!sessionId || !appUserId || !Number.isInteger(actorDatingId) || actorDatingId <= 0) {
        throw new HttpError('Unauthorized', 401)
    }
    return { sessionId, appUserId, actorDatingId }
}

const peerId = (raw: string | undefined) => {
    const parsed = Number(raw)
    if (!Number.isInteger(parsed) || parsed <= 0) throw new HttpError('peerDatingId is required', 400)
    return parsed
}

export const conversationController = {
    async list(request: NextRequest) {
        const { sessionId, appUserId } = requireUser(request)
        return conversationService.list(appUserId, sessionId)
    },
    async messages(request: NextRequest, rawPeerDatingId?: string) {
        const { appUserId } = requireUser(request)
        const url = new URL(request.url)
        const limit = Number(url.searchParams.get('limit') ?? 50)
        const before = url.searchParams.get('before') ?? undefined
        if (!Number.isInteger(limit) || limit < 1 || limit > 100 || (before && Number.isNaN(Date.parse(before)))) {
            throw new HttpError('Invalid messages query', 400)
        }
        return conversationService.messages({
            appUserId,
            peerDatingId: peerId(rawPeerDatingId),
            before,
            limit,
        })
    },
    async send(request: NextRequest, rawPeerDatingId?: string) {
        const { sessionId, appUserId, actorDatingId } = requireUser(request)
        const body = await request.json().catch(() => null)
        if (
            !body ||
            typeof body.body !== 'string' ||
            typeof body.idempotencyKey !== 'string' ||
            body.idempotencyKey.length < 8 ||
            body.idempotencyKey.length > 128
        ) {
            throw new HttpError('Invalid message payload', 400)
        }
        return conversationService.sendMessage({
            appUserId,
            sessionId,
            actorDatingId,
            peerDatingId: peerId(rawPeerDatingId),
            body: body.body,
            idempotencyKey: body.idempotencyKey,
        })
    },
    async gift(request: NextRequest, rawPeerDatingId?: string) {
        const { sessionId, appUserId, actorDatingId } = requireUser(request)
        const body = await request.json().catch(() => null)
        if (
            !body ||
            typeof body.giftId !== 'string' ||
            !body.giftId ||
            typeof body.idempotencyKey !== 'string' ||
            body.idempotencyKey.length < 8 ||
            body.idempotencyKey.length > 128
        ) {
            throw new HttpError('Invalid gift payload', 400)
        }
        return conversationService.sendGift({
            appUserId,
            sessionId,
            actorDatingId,
            peerDatingId: peerId(rawPeerDatingId),
            giftId: body.giftId,
            idempotencyKey: body.idempotencyKey,
        })
    },
    async read(request: NextRequest, rawPeerDatingId?: string) {
        const { appUserId } = requireUser(request)
        return conversationService.markRead(appUserId, peerId(rawPeerDatingId))
    },
    async unlock(request: NextRequest, rawPeerDatingId?: string) {
        const { appUserId } = requireUser(request)
        return conversationService.unlock(appUserId, peerId(rawPeerDatingId))
    },
}
