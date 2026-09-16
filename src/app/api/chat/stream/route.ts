import type { NextRequest } from 'next/server'

import { subscribeChatEvents } from '@/entities/chat/api/server/services/chat-events'
import { USER_COOKIE_NAME } from '@/shared/api/fotochat'

export const dynamic = 'force-dynamic'

export const GET = (request: NextRequest) => {
    const datingId = Number(request.cookies.get(USER_COOKIE_NAME)?.value)
    if (!Number.isInteger(datingId) || datingId <= 0) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
    }

    const encoder = new TextEncoder()
    let unsubscribe: (() => void) | undefined
    let heartbeat: ReturnType<typeof setInterval> | undefined
    const stream = new ReadableStream({
        start(controller) {
            const write = (payload: string) => controller.enqueue(encoder.encode(payload))
            unsubscribe = subscribeChatEvents(datingId, (event) =>
                write(`event: chat\ndata: ${JSON.stringify(event)}\n\n`)
            )
            heartbeat = setInterval(() => write(': ping\n\n'), 25000)
        },
        cancel() {
            unsubscribe?.()
            if (heartbeat) clearInterval(heartbeat)
        },
    })

    return new Response(stream, {
        headers: {
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'Content-Type': 'text/event-stream',
        },
    })
}
