import type { ConversationMessage } from '../../../model/types'

export type ChatEvent = {
    type: 'message.created'
    peerDatingId: number
    message: ConversationMessage
}

type Listener = (event: ChatEvent) => void

const listeners = new Map<number, Set<Listener>>()

export const publishChatEvent = (datingIds: number[], event: ChatEvent) => {
    for (const datingId of new Set(datingIds)) {
        listeners.get(datingId)?.forEach((listener) => listener(event))
    }
}

export const subscribeChatEvents = (datingId: number, listener: Listener) => {
    const channel = listeners.get(datingId) ?? new Set<Listener>()
    channel.add(listener)
    listeners.set(datingId, channel)
    return () => {
        channel.delete(listener)
        if (channel.size === 0) listeners.delete(datingId)
    }
}
